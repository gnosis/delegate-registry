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
  DelegationSet,
} from "../generated/schema"

const padding: Bytes = Bytes.fromHexString("0x000000000000000000000000")

const getDelegationId = (
  contextId: string,
  accountId: string,
  delegateId: string,
): string => `${contextId}-${accountId}-${delegateId}`

const getDelegationSetId = (contextId: string, accountId: string): string =>
  `${contextId}-${accountId}`

export function handleDelegation(event: DelegationUpdated): void {
  const eventTime = event.block.timestamp
  const account: Account = loadOrCreateAccount(event.params.account)
  const context: Context = loadOrCreateContext(event.params.context)
  const currentDelegationsFromEvent: DelegationUpdatedPreviousDelegationStruct[] =
    event.params.previousDelegation
  const newDelegationsFromEvent: DelegationUpdatedDelegationStruct[] =
    event.params.delegation

  const delegationSetId = getDelegationSetId(context.id, account.id)
  const currentDelegationSet = DelegationSet.load(delegationSetId)

  // remove current delegations
  if (currentDelegationSet != null) {
    for (let i = 0; i < currentDelegationsFromEvent.length; i++) {
      const delegationId = getDelegationId(
        context.id,
        account.id,
        currentDelegationsFromEvent[i].delegate.toHexString(),
      )
      const delegation = Delegation.load(delegationId)
      if (delegation == null) {
        log.error(
          "A previous delegation (from event) does not exist in the store. This should not be possible. Delegation id: {}",
          [delegationId],
        )
      }
      store.remove("Delegation", delegationId)
    }
    store.remove("DelegationSet", delegationSetId)
  } else if (currentDelegationsFromEvent.length > 0) {
    log.error(
      "The provided current delegation set from the event is not present in the store. This should not be possible. Missing delegation set with id: {}",
      [delegationSetId],
    )
  }

  let denominator: BigInt = BigInt.fromU32(0)
  for (let i = 0; i < newDelegationsFromEvent.length; i++) {
    const delegation = newDelegationsFromEvent[i]
    denominator = denominator.plus(delegation.ratio)
  }
  const expiration: BigInt = event.params.expirationTimestamp

  const newDelegationSet = new DelegationSet(delegationSetId)
  newDelegationSet.account = account.id
  newDelegationSet.context = context.id
  newDelegationSet.denominator = denominator
  newDelegationSet.expiration = expiration
  newDelegationSet.delegationUpdated = eventTime
  newDelegationSet.expirationUpdated = eventTime
  newDelegationSet.save()

  for (let i = 0; i < newDelegationsFromEvent.length; i++) {
    const delegationFromEvent: DelegationUpdatedDelegationStruct =
      newDelegationsFromEvent[i]
    const delegate: Delegate = loadOrCreateDelegate(
      delegationFromEvent.delegate,
    )
    const delegationId = getDelegationId(context.id, account.id, delegate.id)
    const delegation = new Delegation(delegationId)
    delegation.context = context.id
    delegation.account = account.id
    delegation.delegate = delegate.id
    delegation.delegationSet = delegationSetId
    delegation.numerator = delegationFromEvent.ratio
    delegation.save()
  }
}

export function handleDelegationCleared(event: DelegationCleared): void {
  const from: string = event.params.account.toHexString()
  const context: string = event.params.context.toString()
  const delegations: DelegationClearedDelegatesClearedStruct[] =
    event.params.delegatesCleared
  for (let i = 0; i < delegations.length; i++) {
    const delegationId = getDelegationId(
      context,
      from,
      delegations[i].delegate.toHexString(),
    )
    const delegation = Delegation.load(delegationId)
    if (delegation == null) {
      log.warning(
        "Received delegation cleared event for an unknown delegation. DelegationId: {}",
        [delegationId],
      )
    } else {
      store.remove("Delegation", delegationId)
    }
  }
  const delegationSetId = getDelegationSetId(context, from)
  const delegationSet = DelegationSet.load(delegationSetId)
  if (delegationSet != null) {
    delegationSet.denominator = BigInt.fromU32(0)
    delegationSet.delegationUpdated = event.block.timestamp
    delegationSet.save()
  } else {
    log.warning(
      "Received delegation cleared event for an unknown delegation set. Account {} and context {}.",
      [from, context],
    )
  }
}

export function handleExpirationUpdate(event: ExpirationUpdated): void {
  const account: Account = loadOrCreateAccount(event.params.account)
  const context: Context = loadOrCreateContext(event.params.context)
  const expiration: BigInt = event.params.expirationTimestamp
  const delegationSetId = getDelegationSetId(context.id, account.id)
  const delegationSet = DelegationSet.load(delegationSetId)
  if (delegationSet != null) {
    delegationSet.expiration = expiration
    delegationSet.expirationUpdated = event.block.timestamp
    delegationSet.save()
  } else {
    log.warning(
      "Received expiration time update for an unknown delegation set. Account {} and context {}.",
      [account.id, context.id],
    )
  }
}

export function handleOptout(event: OptOutStatusSet): void {
  const delegateId = padding.concat(
    Bytes.fromHexString(event.params.delegate.toHexString()),
  )
  const delegate: Delegate = loadOrCreateDelegate(delegateId)
  const context: Context = loadOrCreateContext(event.params.context)
  const status: boolean = event.params.optout
  if (status) {
    const optout = loadOrCreateOptout(delegate, context)
    optout.save()
  } else {
    const optoutId = `${context.id}-${delegate.id}`
    store.remove("Optout", optoutId)
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

export function createDelegation(
  context: Context,
  account: Account,
  delegate: Delegate,
  delegationSetId: string,
  numerator: BigInt,
): Delegation {
  const id = getDelegationId(context.id, account.id, delegate.id)
  const entry = new Delegation(id)
  entry.context = context.id
  entry.account = account.id
  entry.delegate = delegate.id
  entry.delegationSet = delegationSetId
  entry.numerator = numerator
  entry.save()
  return entry
}
