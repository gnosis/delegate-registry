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

export const DELEGATION1: DelegationUpdatedDelegationStruct = new DelegationUpdatedDelegationStruct()
DELEGATION1.push(
  // id
  ethereum.Value.fromBytes(Bytes.fromHexString(USER1_ADDRESS.toHex())),
)
DELEGATION1.push(ethereum.Value.fromI32(1)) // ratio

export const DELEGATION2: DelegationUpdatedDelegationStruct = new DelegationUpdatedDelegationStruct()
DELEGATION2.push(
  // id
  ethereum.Value.fromBytes(Bytes.fromHexString(USER2_ADDRESS.toHex())),
)
DELEGATION2.push(ethereum.Value.fromI32(1))

export const DELEGATION3: DelegationUpdatedDelegationStruct = new DelegationUpdatedDelegationStruct()
DELEGATION3.push(
  // id
  ethereum.Value.fromBytes(Bytes.fromHexString(USER3_ADDRESS.toHex())),
)
DELEGATION3.push(ethereum.Value.fromI32(1))

log.info("DELEGATION1 id: {}, ratio: {}", [
  DELEGATION1.id.toHex(),
  DELEGATION1.ratio.toString(),
])
log.info("DELEGATION2 id: {}, ratio: {}", [
  DELEGATION2.id.toHex(),
  DELEGATION2.ratio.toString(),
])
log.info("DELEGATION3 id: {}, ratio: {}", [
  DELEGATION3.id.toHex(),
  DELEGATION3.ratio.toString(),
])

export const DELEGATION: DelegationUpdatedDelegationStruct[] = [
  DELEGATION1,
  DELEGATION2,
  DELEGATION3,
]

export const DELEGATION_ETHEREUM_VALUE = [
  ethereum.Value.fromTuple(DELEGATION1),
  ethereum.Value.fromTuple(DELEGATION2),
  ethereum.Value.fromTuple(DELEGATION3),
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

  // mint 1337 to user 1
  handleDelegation(transferEvent)
  assert.fieldEquals(
    "Delegation",
    `${CONTEXT1}-${USER1_ADDRESS.toHex()}`,
    "expiration",
    EXPIRATION.toString(),
  )
  clearStore()
})
