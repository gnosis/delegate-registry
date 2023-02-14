import {
  BigInt,
  Address,
  store,
  Bytes,
  log,
  ethereum,
} from "@graphprotocol/graph-ts"
import {
  DelegationCleared,
  DelegationUpdated,
  ExpirationUpdated,
  ExpirationUpdatedDelegationStruct,
  DelegationUpdatedPreviousDelegationStruct,
  DelegationUpdatedDelegationStruct,
  DelegationClearedDelegatesClearedStruct,
  OptOutStatusSet,
  DelegateRegistry,
  OptOutStatusSet__Params,
} from "../generated/DelegateRegistry/DelegateRegistry"
import {
  Delegate,
  Account,
  Context,
  Delegation,
  Optout,
} from "../generated/schema"

const padding: Bytes = Bytes.fromHexString("0x000000000000000000000000")

export function handleDelegation(event: DelegationUpdated): void {
  const account: Account = loadOrCreateAccount(event.params.account)
  const context: Context = loadOrCreateContext(event.params.context)
  const currentDelegations: DelegationUpdatedPreviousDelegationStruct[] =
    event.params.previousDelegation
  const delegations: DelegationUpdatedDelegationStruct[] =
    event.params.delegation
  const expiration: BigInt = event.params.expirationTimestamp
  if (currentDelegations.length > 0) {
    for (let i = 0; i < currentDelegations.length; i++) {
      store.remove(
        "Delegation",
        `${context.id}-${account.id}-${currentDelegations[
          i
        ].delegate.toHexString()}`,
      )
      const delegationId = `${context.id}-${account.id}-${currentDelegations[
        i
      ].delegate.toHexString()}`

      const delegation: Delegation | null = Delegation.load(delegationId)
      if (delegation != null) {
        store.remove("Delegation", delegationId)
      }
    }
  }
  let denominator: BigInt = BigInt.fromU32(0)
  for (let i = 0; i < delegations.length; i++) {
    const delegation = delegations[i]
    denominator = denominator.plus(delegation.ratio)
  }
  for (let i = 0; i < delegations.length; i++) {
    const delegation: DelegationUpdatedDelegationStruct = delegations[i]
    const delegate: Delegate = loadOrCreateDelegate(delegation.delegate)
    createOrUpdateDelegation(
      context,
      account,
      delegate,
      delegation.ratio,
      denominator,
      expiration,
    )
  }
}

export function handleDelegationCleared(event: DelegationCleared): void {
  const from: string = event.params.account.toHexString()
  const context: string = event.params.context.toString()
  const delegations: DelegationClearedDelegatesClearedStruct[] =
    event.params.delegatesCleared
  for (let i = 0; i < delegations.length; i++) {
    const delegationId = `${context}-${from}-${delegations[
      i
    ].delegate.toHexString()}`
    const delegation: Delegation | null = Delegation.load(delegationId)
    if (delegation != null) {
      store.remove("Delegation", delegationId)
    }
  }
}

export function handleExpirationUpdate(event: ExpirationUpdated): void {
  const account: Account = loadOrCreateAccount(event.params.account)
  const context: Context = loadOrCreateContext(event.params.context)
  const expiration: BigInt = event.params.expirationTimestamp
  const delegations: ExpirationUpdatedDelegationStruct[] =
    event.params.delegation
  let denominator: BigInt = BigInt.fromU32(0)
  for (let i = 0; i < delegations.length; i++) {
    const delegation = delegations[i]
    denominator = denominator.plus(delegation.ratio)
  }
  for (let i = 0; i < delegations.length; i++) {
    const delegate: Delegate = loadOrCreateDelegate(delegations[i].delegate)
    const delegation: Delegation = createOrUpdateDelegation(
      context,
      account,
      delegate,
      delegations[i].ratio,
      denominator,
      expiration,
    )
    delegation.save()
  }
}

export function handleOptout(event: OptOutStatusSet): void {
  const delegate: Delegate = loadOrCreateDelegate(
    padding.concat(Bytes.fromHexString(event.params.delegate.toHexString())),
  )
  const context: Context = loadOrCreateContext(event.params.context)
  const status: boolean = event.params.optout
  if (status) {
    const optout = loadOrCreateOptout(delegate, context)
    optout.save()
  } else {
    const optoutId = `${context.id}-${delegate.id}`
    const optout: Optout | null = Optout.load(optoutId)
    if (optout != null) {
      store.remove("Optout", optoutId)
    }
  }
}

export function loadOrCreateDelegate(id: Bytes): Delegate {
  let entry: Delegate | null = Delegate.load(id.toHexString())
  if (entry == null) {
    entry = new Delegate(id.toHexString())
  }
  entry.save()
  return entry
}

export function loadOrCreateAccount(id: Address): Account {
  let entry: Account | null = Account.load(id.toHexString())
  if (entry == null) {
    entry = new Account(id.toHexString())
  }
  entry.save()
  return entry
}

export function loadOrCreateContext(id: string): Context {
  let entry: Context | null = Context.load(id)
  if (entry == null) {
    entry = new Context(id)
    entry.save()
  }
  return entry
}

export function loadOrCreateOptout(
  delegate: Delegate,
  context: Context,
): Optout {
  const id = `${context.id}-${delegate.id}`
  let entry: Optout | null = Optout.load(id)
  if (entry == null) {
    entry = new Optout(id)
  }
  entry.delegate = delegate.id
  entry.context = context.id
  entry.save()
  return entry
}

export function createOrUpdateDelegation(
  context: Context,
  account: Account,
  delegate: Delegate,
  numerator: BigInt,
  denominator: BigInt,
  expiration: BigInt,
): Delegation {
  const id = `${context.id}-${account.id}-${delegate.id}`
  let entry: Delegation | null = Delegation.load(id)
  if (entry == null) {
    entry = new Delegation(id)
  }
  entry.context = context.id
  entry.account = account.id
  entry.delegate = delegate.id
  entry.numerator = numerator
  entry.denominator = denominator
  entry.expiration = expiration
  entry.save()
  return entry
}
