import { ExecutionResult } from "graphql"
import { execute, GetTosDocument, GetTosQuery } from "../../.graphclient"

export const getAllDelegationsTo = (): Promise<ExecutionResult<GetTosQuery>> =>
  execute(GetTosDocument, {})
