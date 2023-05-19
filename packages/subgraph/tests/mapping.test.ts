import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import {
  handleDelegation,
  handleDelegationCleared,
  handleOptout,
  getDelegationSetId,
  getOptoutId,
  paddedDelegateToAddress,
} from "../src/mapping"
import {
  DelegationUpdated,
  DelegationUpdatedDelegationStruct,
  DelegationCleared,
  OptOutStatusSet,
} from "../generated/DelegateRegistry/DelegateRegistry"
import { assert, clearStore, newMockEvent, test } from "matchstick-as"

const padding: Bytes = Bytes.fromHexString("0x000000000000000000000000")

const ADDRESS_ZERO = Address.fromString(
  "0x0000000000000000000000000000000000000000",
)
const USER1_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000001",
)
const USER2_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000002",
)
const USER3_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000003",
)
const USER4_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000004",
)
const CONTEXT1 = "context1"
const CONTEXT2 = "context2"

const DELEGATION2: DelegationUpdatedDelegationStruct = new DelegationUpdatedDelegationStruct()
DELEGATION2.push(
  // id
  ethereum.Value.fromBytes(
    Bytes.fromHexString(padding.concat(USER2_ADDRESS).toHex()),
  ),
)
DELEGATION2.push(ethereum.Value.fromI32(1)) // ratio

const DELEGATION3: DelegationUpdatedDelegationStruct = new DelegationUpdatedDelegationStruct()
DELEGATION3.push(
  // id
  ethereum.Value.fromBytes(
    Bytes.fromHexString(padding.concat(USER3_ADDRESS).toHex()),
  ),
)
DELEGATION3.push(ethereum.Value.fromI32(1))

const DELEGATION4: DelegationUpdatedDelegationStruct = new DelegationUpdatedDelegationStruct()
DELEGATION4.push(
  // id
  ethereum.Value.fromBytes(
    Bytes.fromHexString(padding.concat(USER4_ADDRESS).toHex()),
  ),
)
DELEGATION4.push(ethereum.Value.fromI32(1))

const DELEGATION: DelegationUpdatedDelegationStruct[] = [
  DELEGATION2,
  DELEGATION3,
  DELEGATION4,
]
const PREVIOUS_DELEGATION: ethereum.Value[] = []
const DELEGATION_ETHEREUM_VALUE: ethereum.Value[] = [
  ethereum.Value.fromTuple(DELEGATION2),
  ethereum.Value.fromTuple(DELEGATION3),
  ethereum.Value.fromTuple(DELEGATION4),
]
const EXPIRATION = BigInt.fromU32(100)

function createDelegationUpdatedEvent(
  account: Address,
  context: string,
  previousDelegation: ethereum.Value[],
  delegation: ethereum.Value[],
  expirationTimestamp: BigInt,
): DelegationUpdated {
  const mockEvent = newMockEvent()

  const mockParameters = [
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account)),
    new ethereum.EventParam("context", ethereum.Value.fromString(context)),
    new ethereum.EventParam(
      "previousDelegation",
      ethereum.Value.fromArray(previousDelegation),
    ),
    new ethereum.EventParam("delegation", ethereum.Value.fromArray(delegation)),
    new ethereum.EventParam(
      "expirationTimestamp",
      ethereum.Value.fromUnsignedBigInt(expirationTimestamp),
    ),
  ]

  const newDelegationUpdatedEvent = new DelegationUpdated(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockParameters,
    mockEvent.receipt,
  )

  return newDelegationUpdatedEvent
}

function createDelegationClearedEvent(
  account: Address,
  context: string,
  delegation: ethereum.Value[],
): DelegationCleared {
  const mockEvent = newMockEvent()

  const mockParameters = [
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account)),
    new ethereum.EventParam("context", ethereum.Value.fromString(context)),
    new ethereum.EventParam("delegation", ethereum.Value.fromArray(delegation)),
  ]

  const newExpirationUpdatedEvent = new DelegationCleared(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockParameters,
    mockEvent.receipt,
  )

  return newExpirationUpdatedEvent
}

function createOptoutEvent(
  delegate: Address,
  context: string,
  optout: boolean,
): OptOutStatusSet {
  const mockEvent = newMockEvent()

  const mockParameters = [
    new ethereum.EventParam("delegation", ethereum.Value.fromAddress(delegate)),
    new ethereum.EventParam("context", ethereum.Value.fromString(context)),
    new ethereum.EventParam("optout", ethereum.Value.fromBoolean(optout)),
  ]

  const newOptoutEvent = new OptOutStatusSet(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockParameters,
    mockEvent.receipt,
  )

  return newOptoutEvent
}

///////////
/* TESTS */
///////////

test("DelegationUpdated() event adds delegations", () => {
  let delegationEvent = createDelegationUpdatedEvent(
    USER1_ADDRESS,
    CONTEXT1,
    PREVIOUS_DELEGATION,
    DELEGATION_ETHEREUM_VALUE,
    EXPIRATION,
  )

  handleDelegation(delegationEvent)
  // check DELEGATION2
  const delegationSetId = getDelegationSetId(
    CONTEXT1,
    USER1_ADDRESS.toHex(),
    delegationEvent.block.number,
    delegationEvent.transaction.index,
    delegationEvent.transactionLogIndex,
  )
  assert.fieldEquals(
    "DelegationSet",
    delegationSetId,
    "expireTimestamp",
    EXPIRATION.toString(),
  )
  assert.fieldEquals(
    "DelegationSet",
    delegationSetId,
    "fromAccount",
    USER1_ADDRESS.toHex(),
  )

  assert.fieldEquals("DelegationSet", delegationSetId, "denominator", "3")

  const delegate2Address = paddedDelegateToAddress(
    DELEGATION2.delegate.toHex(),
  ).toHex()
  assert.fieldEquals(
    "Delegation",
    `${delegationSetId}-${delegate2Address}`,
    "toAccount",
    delegate2Address,
  )
  assert.fieldEquals(
    "Delegation",
    `${delegationSetId}-${delegate2Address}`,
    "numerator",
    DELEGATION2.ratio.toString(),
  )

  // check DELEGATION3
  const delegate3Address = paddedDelegateToAddress(
    DELEGATION3.delegate.toHex(),
  ).toHex()
  assert.fieldEquals(
    "Delegation",
    `${delegationSetId}-${delegate3Address}`,
    "toAccount",
    delegate3Address,
  )
  assert.fieldEquals(
    "Delegation",
    `${delegationSetId}-${delegate3Address}`,
    "numerator",
    DELEGATION3.ratio.toString(),
  )

  // check DELEGATION4
  const delegate4Address = paddedDelegateToAddress(
    DELEGATION4.delegate.toHex(),
  ).toHex()
  assert.fieldEquals(
    "Delegation",
    `${delegationSetId}-${delegate4Address}`,
    "toAccount",
    delegate4Address,
  )
  assert.fieldEquals(
    "Delegation",
    `${delegationSetId}-${delegate4Address}`,
    "numerator",
    DELEGATION4.ratio.toString(),
  )

  clearStore()
})

test("DelegationCleared() event creates a empty delegationSet", () => {
  const delegationEvent = createDelegationUpdatedEvent(
    USER1_ADDRESS,
    CONTEXT1,
    PREVIOUS_DELEGATION,
    DELEGATION_ETHEREUM_VALUE,
    EXPIRATION,
  )
  const delegationCleared = createDelegationClearedEvent(
    USER1_ADDRESS,
    CONTEXT1,
    DELEGATION_ETHEREUM_VALUE,
  )
  handleDelegation(delegationEvent)
  const delegationSetId1 = getDelegationSetId(
    CONTEXT1,
    USER1_ADDRESS.toHex(),
    delegationEvent.block.number,
    delegationEvent.transaction.index,
    delegationEvent.transactionLogIndex,
  )

  assert.fieldEquals(
    "DelegationSet",
    delegationSetId1,
    "expireTimestamp",
    EXPIRATION.toString(),
  )

  assert.fieldEquals("DelegationSet", delegationSetId1, "denominator", "3")

  handleDelegationCleared(delegationCleared)
  const delegationSetId2 = getDelegationSetId(
    CONTEXT1,
    USER1_ADDRESS.toHex(),
    delegationCleared.block.number,
    delegationCleared.transaction.index,
    delegationCleared.transactionLogIndex,
  )
  assert.fieldEquals(
    "DelegationSet",
    delegationSetId2,
    "creationTimestamp",
    delegationCleared.block.timestamp.toString(),
  )

  assert.fieldEquals("DelegationSet", delegationSetId2, "denominator", "0")

  clearStore()
})

test("OptOutStatusSet() adds optout to store", () => {
  const optout = createOptoutEvent(USER1_ADDRESS, CONTEXT1, true)
  handleOptout(optout)

  const optoutId = getOptoutId(
    CONTEXT1,
    USER1_ADDRESS.toHex(),
    optout.block.number,
    optout.transaction.index,
    optout.transactionLogIndex,
  )

  assert.fieldEquals("Optout", optoutId, "account", USER1_ADDRESS.toHexString())
  assert.fieldEquals("Optout", optoutId, "inContext", CONTEXT1)
  assert.fieldEquals("Optout", optoutId, "status", "true")
  clearStore()
})
test("OptOutStatusSet() with false should create a new optout", () => {
  const optout = createOptoutEvent(USER1_ADDRESS, CONTEXT1, true)
  const optin = createOptoutEvent(USER1_ADDRESS, CONTEXT1, false)
  handleOptout(optout)

  const optoutId = getOptoutId(
    CONTEXT1,
    USER1_ADDRESS.toHex(),
    optout.block.number,
    optout.transaction.index,
    optout.transactionLogIndex,
  )

  assert.fieldEquals("Optout", optoutId, "account", USER1_ADDRESS.toHexString())
  assert.fieldEquals("Optout", optoutId, "inContext", CONTEXT1)
  assert.fieldEquals("Optout", optoutId, "status", "true")
  handleOptout(optin)
  const optinId = getOptoutId(
    CONTEXT1,
    USER1_ADDRESS.toHex(),
    optin.block.number,
    optin.transaction.index,
    optin.transactionLogIndex,
  )
  assert.fieldEquals("Optout", optinId, "account", USER1_ADDRESS.toHexString())
  assert.fieldEquals("Optout", optinId, "inContext", CONTEXT1)
  assert.fieldEquals("Optout", optinId, "status", "false")
  clearStore()
})
