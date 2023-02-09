// TODO: Replace with a real storage solution
let storage: { [address: string]: number } = {}

export const storeNewSetOfDelegatedVoteWeight = async (delegatedVoteWeight: {
  [address: string]: number
}) => {
  storage = delegatedVoteWeight
}

export const getTopDelegatedVoteWeight = async (count: number) => {
  return Object.entries(storage)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([address, score]) => ({ address, score }))
}

export const getDelegatedVoteWeight = async (addresses: string[]) => {
  return addresses.map((address) => ({
    address,
    score: storage[address] || 0,
  }))
}
