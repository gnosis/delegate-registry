import { ExecutionResult } from "graphql"
import {
  execute,
  GetContextDocument,
  GetContextQuery,
} from "../../.graphclient"

export type Ratio = {
  numerator: number
  denominator: number
}

export const getContext = async (
  snapshotSpace: string,
): Promise<ExecutionResult<GetContextQuery>> =>
  execute(GetContextDocument, { contextId: snapshotSpace })
