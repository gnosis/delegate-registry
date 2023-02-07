import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { handleDelegation } from "../src/mapping"
import { Delegation } from "../generated/schema"
import {
  DelegationUpdated,
  DelegationUpdatedDelegationStruct,
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

export const DELEGATION_ETHEREUM_VALUE = [
  ethereum.Value.fromTuple(DELEGATION2),
  ethereum.Value.fromTuple(DELEGATION3),
  ethereum.Value.fromTuple(DELEGATION4),
]
export const EXPIRATION = BigInt.fromU32(100)

function createDelegationUpdatedEvent(
  from: Address,
  context: string,
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

test("DelegationUpdated() event adds delegations", () => {
  let transferEvent = createDelegationUpdatedEvent(
    USER1_ADDRESS,
    CONTEXT1,
    DELEGATION_ETHEREUM_VALUE,
    EXPIRATION,
  )

  handleDelegation(transferEvent)
  // check DELEGATION2
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION2.id.toHex()}`,
    "from",
    USER1_ADDRESS.toHex(),
  )
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION2.id.toHex()}`,
    "to",
    DELEGATION2.id.toHex(),
  )
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION2.id.toHex()}`,
    "ratio",
    DELEGATION2.ratio.toString(),
  )
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION2.id.toHex()}`,
    "expiration",
    EXPIRATION.toString(),
  )

  // check DELEGATION3
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION3.id.toHex()}`,
    "from",
    USER1_ADDRESS.toHex(),
  )
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION3.id.toHex()}`,
    "to",
    DELEGATION3.id.toHex(),
  )
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION3.id.toHex()}`,
    "ratio",
    DELEGATION3.ratio.toString(),
  )
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION3.id.toHex()}`,
    "expiration",
    EXPIRATION.toString(),
  )

  // check DELEGATION4
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION4.id.toHex()}`,
    "from",
    USER1_ADDRESS.toHex(),
  )
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION4.id.toHex()}`,
    "to",
    DELEGATION4.id.toHex(),
  )
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION4.id.toHex()}`,
    "ratio",
    DELEGATION4.ratio.toString(),
  )
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}-${DELEGATION4.id.toHex()}`,
    "expiration",
    EXPIRATION.toString(),
  )

  clearStore()
})
