import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import {
  handleDelegation,
  handleExpirationUpdate,
  handleDelegationCleared,
  handleOptout,
} from "../src/mapping"
import { Delegation, Optout } from "../generated/schema"
import {
  DelegationUpdated,
  DelegationUpdatedDelegationStruct,
  DelegationCleared,
  ExpirationUpdated,
  OptOutStatusSet,
} from "../generated/DelegateRegistry/DelegateRegistry"
import { assert, clearStore, log, newMockEvent, test } from "matchstick-as"

export const ADDRESS_ZERO = Address.fromString(
  "0x0000000000000000000000000000000000000000",
)

export const USER1_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000001",
)
export const USER2_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000002",
)
export const USER3_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000003",
)
export const USER4_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000004",
)
export const CONTEXT1 = "context1"
export const CONTEXT2 = "context2"

export const DELEGATION2: DelegationUpdatedDelegationStruct = new DelegationUpdatedDelegationStruct()
DELEGATION2.push(
  // id
  ethereum.Value.fromBytes(Bytes.fromHexString(USER2_ADDRESS.toHex())),
)
DELEGATION2.push(ethereum.Value.fromI32(1)) // ratio

export const DELEGATION3: DelegationUpdatedDelegationStruct = new DelegationUpdatedDelegationStruct()
DELEGATION3.push(
  // id
  ethereum.Value.fromBytes(Bytes.fromHexString(USER3_ADDRESS.toHex())),
)
DELEGATION3.push(ethereum.Value.fromI32(1))

export const DELEGATION4: DelegationUpdatedDelegationStruct = new DelegationUpdatedDelegationStruct()
DELEGATION4.push(
  // id
  ethereum.Value.fromBytes(Bytes.fromHexString(USER4_ADDRESS.toHex())),
)
DELEGATION4.push(ethereum.Value.fromI32(1))

export const DELEGATION: DelegationUpdatedDelegationStruct[] = [
  DELEGATION2,
  DELEGATION3,
  DELEGATION4,
]
export const PREVIOUS_DELEGATION: ethereum.Value[] = []
export const DELEGATION_ETHEREUM_VALUE: ethereum.Value[] = [
  ethereum.Value.fromTuple(DELEGATION2),
  ethereum.Value.fromTuple(DELEGATION3),
  ethereum.Value.fromTuple(DELEGATION4),
]
export const EXPIRATION = BigInt.fromU32(100)

function createDelegationUpdatedEvent(
  from: Address,
  context: string,
  previousDelegation: ethereum.Value[],
  delegation: ethereum.Value[],
  expirationTimestamp: BigInt,
): DelegationUpdated {
  let mockEvent = newMockEvent()

  mockEvent.parameters = new Array()

  mockEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from)),
  )
  mockEvent.parameters.push(
    new ethereum.EventParam("context", ethereum.Value.fromString(context)),
  )
  mockEvent.parameters.push(
    new ethereum.EventParam(
      "previousDelegation",
      ethereum.Value.fromArray(previousDelegation),
    ),
  )
  mockEvent.parameters.push(
    new ethereum.EventParam("delegation", ethereum.Value.fromArray(delegation)),
  )
  mockEvent.parameters.push(
    new ethereum.EventParam(
      "expirationTimestamp",
      ethereum.Value.fromUnsignedBigInt(expirationTimestamp),
    ),
  )

  let newDelegationUpdatedEvent = new DelegationUpdated(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  )

  return newDelegationUpdatedEvent
}

function createExpirationUpdatedEvent(
  from: Address,
  context: string,
  delegation: ethereum.Value[],
  expirationTimestamp: BigInt,
): ExpirationUpdated {
  let mockEvent = newMockEvent()

  mockEvent.parameters = new Array()

  mockEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from)),
  )
  mockEvent.parameters.push(
    new ethereum.EventParam("context", ethereum.Value.fromString(context)),
  )
  mockEvent.parameters.push(
    new ethereum.EventParam("delegation", ethereum.Value.fromArray(delegation)),
  )
  mockEvent.parameters.push(
    new ethereum.EventParam(
      "expirationTimestamp",
      ethereum.Value.fromUnsignedBigInt(expirationTimestamp),
    ),
  )

  let newExpirationUpdatedEvent = new ExpirationUpdated(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  )

  return newExpirationUpdatedEvent
}

function createDelegationClearedEvent(
  from: Address,
  context: string,
  delegation: ethereum.Value[],
): DelegationCleared {
  let mockEvent = newMockEvent()

  mockEvent.parameters = new Array()

  mockEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from)),
  )
  mockEvent.parameters.push(
    new ethereum.EventParam("context", ethereum.Value.fromString(context)),
  )
  mockEvent.parameters.push(
    new ethereum.EventParam("delegation", ethereum.Value.fromArray(delegation)),
  )

  let newExpirationUpdatedEvent = new DelegationCleared(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt,
  )

  return newExpirationUpdatedEvent
}

function createOptoutEvent(
  delegate: Address,
  context: string,
  optout: boolean,
): OptOutStatusSet {
  let mockEvent = newMockEvent()

  mockEvent.parameters = new Array()

  mockEvent.parameters.push(
    new ethereum.EventParam("delegation", ethereum.Value.fromAddress(delegate)),
  )
  mockEvent.parameters.push(
    new ethereum.EventParam("context", ethereum.Value.fromString(context)),
  )
  mockEvent.parameters.push(
    new ethereum.EventParam("optout", ethereum.Value.fromBoolean(optout)),
  )

  let newOptoutEvent = new OptOutStatusSet(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
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
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION2.delegate.toHex()}`,
    "from",
    USER1_ADDRESS.toHex(),
  )
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION2.delegate.toHex()}`,
    "to",
    DELEGATION2.delegate.toHex(),
  )
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION2.delegate.toHex()}`,
    "ratio",
    DELEGATION2.ratio.toString(),
  )
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION2.delegate.toHex()}`,
    "expiration",
    EXPIRATION.toString(),
  )

  // check DELEGATION3
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION3.delegate.toHex()}`,
    "from",
    USER1_ADDRESS.toHex(),
  )
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION3.delegate.toHex()}`,
    "to",
    DELEGATION3.delegate.toHex(),
  )
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION3.delegate.toHex()}`,
    "ratio",
    DELEGATION3.ratio.toString(),
  )
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION3.delegate.toHex()}`,
    "expiration",
    EXPIRATION.toString(),
  )

  // check DELEGATION4
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION4.delegate.toHex()}`,
    "from",
    USER1_ADDRESS.toHex(),
  )
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION4.delegate.toHex()}`,
    "to",
    DELEGATION4.delegate.toHex(),
  )
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION4.delegate.toHex()}`,
    "ratio",
    DELEGATION4.ratio.toString(),
  )
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION4.delegate.toHex()}`,
    "expiration",
    EXPIRATION.toString(),
  )

  clearStore()
})

test("DelegationUpdated() event removes previous delegations", () => {
  let delegationEvent1 = createDelegationUpdatedEvent(
    USER1_ADDRESS,
    CONTEXT1,
    PREVIOUS_DELEGATION,
    DELEGATION_ETHEREUM_VALUE,
    EXPIRATION,
  )

  const newDelegation: ethereum.Value[] = [
    ethereum.Value.fromTuple(DELEGATION2),
  ]

  const delegationEvent2 = createDelegationUpdatedEvent(
    USER1_ADDRESS,
    CONTEXT1,
    DELEGATION_ETHEREUM_VALUE,
    newDelegation,
    EXPIRATION,
  )
  handleDelegation(delegationEvent1)

  handleDelegation(delegationEvent2)

  // check DELEGATION2
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION2.delegate.toHex()}`,
    "from",
    USER1_ADDRESS.toHex(),
  )
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION2.delegate.toHex()}`,
    "to",
    DELEGATION2.delegate.toHex(),
  )
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION2.delegate.toHex()}`,
    "ratio",
    DELEGATION2.ratio.toString(),
  )
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION2.delegate.toHex()}`,
    "expiration",
    EXPIRATION.toString(),
  )

  // check DELEGATION3 has been removed from store
  assert.notInStore(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION3.delegate.toHex()}`,
  )

  // check DELEGATION4
  assert.notInStore(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION4.delegate.toHex()}`,
  )
  clearStore()
})

test("ExpirationUpdated() event updates expirations", () => {
  const delegationEvent = createDelegationUpdatedEvent(
    USER1_ADDRESS,
    CONTEXT1,
    PREVIOUS_DELEGATION,
    DELEGATION_ETHEREUM_VALUE,
    EXPIRATION,
  )
  const newExpiration: BigInt = BigInt.fromU32(500)
  const expirationUpdateEvent = createExpirationUpdatedEvent(
    USER1_ADDRESS,
    CONTEXT1,
    DELEGATION_ETHEREUM_VALUE,
    newExpiration,
  )
  handleDelegation(delegationEvent)
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION2.delegate.toHex()}`,
    "expiration",
    EXPIRATION.toString(),
  )
  handleExpirationUpdate(expirationUpdateEvent)
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION2.delegate.toHex()}`,
    "expiration",
    newExpiration.toString(),
  )
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION3.delegate.toHex()}`,
    "expiration",
    newExpiration.toString(),
  )
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION4.delegate.toHex()}`,
    "expiration",
    newExpiration.toString(),
  )
})

test("DelegationCleared() event clears delegations", () => {
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
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION2.delegate.toHex()}`,
    "expiration",
    EXPIRATION.toString(),
  )
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION3.delegate.toHex()}`,
    "expiration",
    EXPIRATION.toString(),
  )
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION4.delegate.toHex()}`,
    "expiration",
    EXPIRATION.toString(),
  )
  handleDelegationCleared(delegationCleared)
  assert.notInStore(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION2.delegate.toHex()}`,
  )
  assert.notInStore(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION3.delegate.toHex()}`,
  )
  assert.notInStore(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION4.delegate.toHex()}`,
  )
})

test("OptOutStatusSet() adds optout to store", () => {
  const optout = createOptoutEvent(USER1_ADDRESS, CONTEXT1, true)
  handleOptout(optout)
  assert.fieldEquals(
    "Optout",
    `${CONTEXT1}-${USER1_ADDRESS.toHexString()}`,
    "from",
    USER1_ADDRESS.toHexString(),
  )
  assert.fieldEquals(
    "Optout",
    `${CONTEXT1}-${USER1_ADDRESS.toHexString()}`,
    "context",
    CONTEXT1,
  )
})
test("OptOutStatusSet() with false optout status removes entity from store", () => {
  const optout = createOptoutEvent(USER1_ADDRESS, CONTEXT1, true)
  const optin = createOptoutEvent(USER1_ADDRESS, CONTEXT1, false)
  handleOptout(optout)
  assert.fieldEquals(
    "Optout",
    `${CONTEXT1}-${USER1_ADDRESS.toHexString()}`,
    "from",
    USER1_ADDRESS.toHexString(),
  )
  assert.fieldEquals(
    "Optout",
    `${CONTEXT1}-${USER1_ADDRESS.toHexString()}`,
    "context",
    CONTEXT1,
  )
  handleOptout(optin)
  assert.notInStore("Optout", `${CONTEXT1}-${USER1_ADDRESS.toHexString()}`)
})

test("DelegationCleared() for non existing delegation is ignored", () => {
  const delegationCleared = createDelegationClearedEvent(
    USER1_ADDRESS,
    CONTEXT1,
    DELEGATION_ETHEREUM_VALUE,
  )
  assert.notInStore(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION2.delegate.toHex()}`,
  )
  handleDelegationCleared(delegationCleared)
  assert.notInStore(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION2.delegate.toHex()}`,
  )
})
