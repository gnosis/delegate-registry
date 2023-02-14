import { ExecutionResult } from "graphql"
import {
  execute,
  GetDelegatesDocument,
  GetDelegatesQuery,
} from "../../.graphclient"
import { utils } from "ethers"
const { getAddress } = utils

export type Ratio = {
  numerator: number
  denominator: number
}

export const getAllDelegationsTo = async () => {
  const responds: ExecutionResult<GetDelegatesQuery> = await execute(
    GetDelegatesDocument,
    {},
  )

  return responds.data?.delegates.reduce(
    (acc, { id: delegate, delegations }) => {
      acc[getAddress(delegate.slice(-40))] = delegations.reduce(
        (acc, { account: { id: accountAddress }, numerator, denominator }) => {
          acc[getAddress(accountAddress)] = { numerator, denominator }
          return acc
        },
        {} as Record<string, Ratio>,
      )
      return acc
    },
    {} as Record<string, Record<string, Ratio>>,
  )
}
