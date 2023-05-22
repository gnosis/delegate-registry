import { BigInt, Address } from "@graphprotocol/graph-ts"
import {
  DelegationCleared,
  DelegationUpdated,
  ExpirationUpdated,
  DelegationUpdatedDelegationStruct,
  OptOutStatusSet,
} from "../generated/DelegateRegistry/DelegateRegistry"
import {
  Account,
  Context,
  Delegation,
  Optout,
  DelegationSet,
} from "../generated/schema"

export const getDelegationId = (
  delegationSetId: string,
  toAccountId: string,
): string => `${delegationSetId}-${toAccountId}`

export const getDelegationSetId = (
  contextId: string,
  accountId: string,
  blocknumber: BigInt,
  transactionIndex: BigInt,
  transactionLogIndex: BigInt,
): string =>
  `${contextId}-${accountId}-${blocknumber.toString()}-${transactionIndex.toString()}-${transactionLogIndex.toString()}`

export const getOptoutId = (
  contextId: string,
  accountId: string,
  blocknumber: BigInt,
  transactionIndex: BigInt,
  transactionLogIndex: BigInt,
): string =>
  `${contextId}-${accountId}-${blocknumber.toString()}-${transactionIndex.toString()}-${transactionLogIndex.toString()}`

/**
 *
 * @param delegate padded delegate
 * @returns delegate address
 */
export const paddedDelegateToAddress = (delegate: string): Address =>
  Address.fromString(delegate.substr(26))

export function handleDelegation(event: DelegationUpdated): void {
  const eventTime = event.block.timestamp
  const fromAccount: Account = loadOrCreateAccount(event.params.account)
  const inContext: Context = loadOrCreateContext(event.params.context)
  const newDelegationsFromEvent: DelegationUpdatedDelegationStruct[] =
    event.params.delegation

  const delegationSetId = getDelegationSetId(
    inContext.id,
    fromAccount.id,
    event.block.number,
    event.transaction.index,
    event.transactionLogIndex,
  )

  const expiration: BigInt = event.params.expirationTimestamp

  let denominator: BigInt = BigInt.fromU32(0)
  for (let i = 0; i < newDelegationsFromEvent.length; i++) {
    const delegation = newDelegationsFromEvent[i]
    denominator = denominator.plus(delegation.ratio)
  }

  const newDelegationSet = new DelegationSet(delegationSetId)
  newDelegationSet.fromAccount = fromAccount.id
  newDelegationSet.inContext = inContext.id
  newDelegationSet.denominator = denominator
  newDelegationSet.expireTimestamp = expiration
  newDelegationSet.creationTimestamp = eventTime
  newDelegationSet.save()

  for (let i = 0; i < newDelegationsFromEvent.length; i++) {
    const delegationFromEvent: DelegationUpdatedDelegationStruct =
      newDelegationsFromEvent[i]
    const delegateAddress: Address = paddedDelegateToAddress(
      delegationFromEvent.delegate.toHex(),
    )
    const toAccount: Account = loadOrCreateAccount(delegateAddress)
    const delegationId = getDelegationId(newDelegationSet.id, toAccount.id)
    const delegation = new Delegation(delegationId)
    delegation.toAccount = toAccount.id
    delegation.belongsToDelegationSet = delegationSetId
    delegation.numerator = delegationFromEvent.ratio
    delegation.save()
  }
}

export function handleDelegationCleared(event: DelegationCleared): void {
  const eventTime = event.block.timestamp
  const fromAddress: string = event.params.account.toHexString()
  const context: string = event.params.context.toString()
  // create empty delegation set
  const delegationSetId = getDelegationSetId(
    context,
    fromAddress,
    event.block.number,
    event.transaction.index,
    event.transactionLogIndex,
  )

  const newDelegationSet = new DelegationSet(delegationSetId)
  newDelegationSet.fromAccount = fromAddress
  newDelegationSet.inContext = context
  newDelegationSet.denominator = BigInt.fromI32(0)
  newDelegationSet.creationTimestamp = eventTime
  newDelegationSet.save()
}

export function handleExpirationUpdate(event: ExpirationUpdated): void {
  // should be removed
}

export function handleOptout(event: OptOutStatusSet): void {
  const eventTime = event.block.timestamp
  const account: Account = loadOrCreateAccount(event.params.delegate)
  const inContext: Context = loadOrCreateContext(event.params.context)
  const status: boolean = event.params.optout
  const id = getOptoutId(
    inContext.id,
    account.id,
    event.block.number,
    event.transaction.index,
    event.transactionLogIndex,
  )
  const optout = new Optout(id)
  optout.account = account.id
  optout.inContext = inContext.id
  optout.status = status
  optout.creationTimestamp = eventTime
  optout.save()
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
