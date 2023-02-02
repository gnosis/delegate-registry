import {
  BigInt,
  log,
  BigDecimal,
  Address,
  store,
  Bytes,
  dataSource,
} from "@graphprotocol/graph-ts"
import {
  DelegationUpdated,
  DelegationUpdatedDelegationStruct,
} from "../generated/DelegateRegistry/DelegateRegistry"
import { To, From, Context, Delegation } from "../generated/schema"

export function handleDelegation(event: DelegationUpdated): void {
  const from: From = loadOrCreateFrom(event.params.delegator)
  const context: Context = loadOrCreateContext(event.params.id)
  const expiration: BigInt = event.params.expiration
  const delegations: DelegationUpdatedDelegationStruct[] =
    event.params.delegation

  for (let index = 0; index < delegations.length; index++) {
    const element = array[index]
  }
}

export function loadOrCreateTo(id: Bytes): To {
  let entry: To | null = To.load(id.toHexString())
  if (entry == null) {
    entry = new To(id.toHexString())
  }
  return entry
}

export function loadOrCreateFrom(id: Address): From {
  let entry: From | null = From.load(id.toHexString())
  if (entry == null) {
    entry = new From(id.toHexString())
  }
  return entry
}

export function loadOrCreateContext(id: string): Context {
  let entry: Context | null = Context.load(id)
  if (entry == null) {
    entry = new Context(id)
  }
  return entry
}

export function loadOrCreateDelegation(
  context: string,
  from: From,
  to: To,
  ratio: BigInt,
  expiration: BigInt,
): Delegation {
  const id: string = context.concat(from.id)
  let entry: Delegation | null = Delegation.load(id)
  if (entry == null) {
    entry = new Delegation(id)
    entry.context = context
    entry.from = from.id
    entry.to = To.id
    entry.ratio = ratio
    entry.expiration = expiration
  }
  return entry
}
