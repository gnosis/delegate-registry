import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Delegation } from "../generated/schema"
import {
  DelegationUpdated,
  DelegationUpdatedDelegationStruct,
} from "../generated/DelegateRegistry/DelegateRegistry"
import { newMockEvent, test } from "matchstick-as"

export const ADDRESS_ZERO = ethereum.Value.fromAddress(
  Address.fromString("0x0000000000000000000000000000000000000000"),
)
export const USER1_ADDRESS = ethereum.Value.fromAddress(
  Address.fromString("0x0000000000000000000000000000000000000001"),
)
export const USER2_ADDRESS = ethereum.Value.fromAddress(
  Address.fromString("0x0000000000000000000000000000000000000002"),
)
export const USER3_ADDRESS = ethereum.Value.fromAddress(
  Address.fromString("0x0000000000000000000000000000000000000003"),
)
export const USER4_ADDRESS = ethereum.Value.fromAddress(
  Address.fromString("0x0000000000000000000000000000000000000004"),
)
export const CONTEXT1 = ethereum.Value.fromString("context1")
export const CONTEXT2 = ethereum.Value.fromString("context2")
export const DELEGATION1: DelegationUpdatedDelegationStruct = new DelegationUpdatedDelegationStruct(
  [USER1_ADDRESS, ethereum.Value.fromI32(1)],
)
export const DELEGATION2: DelegationUpdatedDelegationStruct = new DelegationUpdatedDelegationStruct(
  [USER2_ADDRESS, ethereum.Value.fromI32(2)],
)
export const DELEGATION3: DelegationUpdatedDelegationStruct = new DelegationUpdatedDelegationStruct(
  [USER3_ADDRESS, ethereum.Value.fromI32(3)],
)
export const DELEGATION: DelegationUpdatedDelegationStruct[] = [
  DELEGATION1,
  DELEGATION2,
  DELEGATION3,
]

function createDelegationUpdatedEvent(
  from: string,
  context: string,
  delegation: DelegationUpdatedDelegationStruct[],
  expirationTimestamp: BigInt,
): DelegationUpdated {
  let mockEvent = newMockEvent()

  mockEvent.parameters = new Array()

  mockEvent.parameters.push(
    new ethereum.EventParam(
      "from",
      ethereum.Value.fromAddress(Address.fromString(from)),
    ),
  )
  mockEvent.parameters.push(
    new ethereum.EventParam("context", ethereum.Value.fromString(context)),
  )
  mockEvent.parameters.push(
    new ethereum.EventParam(
      "delegation",
      ethereum.Value.fromTupleArray(delegation),
    ),
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
    DELEGATION,
    100,
  )

  // mint 1337 to user 1
  handleDelegation(transferEvent)
  assert.fieldEquals(
    "Delegation",
    CONTEXT1.concat("-").concat(USER1_ADDRESS.toHexString()),
    "expiration",
    100,
  )
  clearStore()
})
