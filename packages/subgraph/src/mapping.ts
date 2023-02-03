import { BigInt, Address, store, Bytes } from "@graphprotocol/graph-ts"
import {
  DelegationCleared,
  DelegationUpdated,
  DelegationUpdatedDelegationStruct,
  DelegationClearedDelegatesClearedStruct,
  ExpirationUpdated,
} from "../generated/DelegateRegistry/DelegateRegistry"
import { To, From, Context, Delegation } from "../generated/schema"

export function handleDelegation(event: DelegationUpdated): void {
  const from: From = loadOrCreateFrom(event.params.delegator)
  const context: Context = loadOrCreateContext(event.params.id)
  const expiration: BigInt = event.params.expirationTimestamp
  const delegations: DelegationUpdatedDelegationStruct[] =
    event.params.delegation

  for (let i = 0; i < delegations.length; i++) {
    const delegation: DelegationUpdatedDelegationStruct = delegations[i]
    loadOrCreateDelegation(
      context,
      from,
      loadOrCreateTo(delegation.id),
      delegation.ratio,
      expiration,
    )
  }
}

export function handleDelegationCleared(event: DelegationCleared): void {
  const from: string = event.params.delegator.toHexString()
  const delegations: DelegationClearedDelegatesClearedStruct[] =
    event.params.delegatesCleared
  for (let i = 0; i < delegations.length; i++) {
    // const delegationId = event.para
    const delegationId: string = delegations[i].id
      .toHexString()
      .concat("-")
      .concat(from)
    store.remove("Delegation", delegationId)
  }
}

export function handleExpirationUpdate(event: ExpirationUpdated): void {
  const from: From = loadOrCreateFrom(event.params.delegator)
  const context: Context = loadOrCreateContext(event.params.id)
  const expiration: BigInt = event.params.expirationTimestamp
  const delegations: DelegationUpdatedDelegationStruct[] =
    event.params.delegation
  for (let i = 0; i < delegations.length; i++) {
    // const delegationId = event.para
    const to: To = loadOrCreateTo(delegations[i].id)
    const delegation: Delegation = loadOrCreateDelegation(
      context,
      from,
      to,
      delegations[i].ratio,
      expiration,
    )
    delegation.expiration = expiration
    delegation.save
  }
}

export function loadOrCreateTo(id: Bytes): To {
  let entry: To | null = To.load(id.toHexString())
  if (entry == null) {
    entry = new To(id.toHexString())
  }
  entry.save()
  return entry
}

export function loadOrCreateFrom(id: Address): From {
  let entry: From | null = From.load(id.toHexString())
  if (entry == null) {
    entry = new From(id.toHexString())
  }
  entry.save()
  return entry
}

export function loadOrCreateContext(id: string): Context {
  let entry: Context | null = Context.load(id)
  if (entry == null) {
    entry = new Context(id)
  }
  entry.save()
  return entry
}

export function loadOrCreateDelegation(
  context: Context,
  from: From,
  to: To,
  ratio: BigInt,
  expiration: BigInt,
): Delegation {
  const id: string = context.id.concat(from.id)
  let entry: Delegation | null = Delegation.load(id)
  if (entry == null) {
    entry = new Delegation(id)
    entry.context = context.id
    entry.from = from.id
    entry.to = to.id
    entry.ratio = ratio
    entry.expiration = expiration
  }
  entry.save()
  return entry
}
