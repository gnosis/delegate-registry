import { ExecutionResult } from "graphql"
import { execute, GetTosDocument, GetTosQuery } from "../../.graphclient"
import { utils } from "ethers"

const { getAddress } = utils

export const getAllDelegationsTo = async () => {
  const responds: ExecutionResult<GetTosQuery> = await execute(
    GetTosDocument,
    {},
  )

  return responds.data?.tos.reduce(
    (acc, { id: representative, delegations }) => {
      acc[getAddress(representative.slice(-40))] = delegations.reduce(
        (acc, { from: { id: delegator }, ratio }) => {
          acc[getAddress(delegator)] = ratio
          return acc
        },
        {} as Record<string, number>,
      )
      return acc
    },
    {} as Record<string, Record<string, number>>,
  )
}
