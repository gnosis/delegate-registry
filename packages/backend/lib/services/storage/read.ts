// To be used by the Vercel Edge Function
import { get } from "@vercel/edge-config"

export const getDelegatedVoteWeight = (snapshotSpace: string) =>
  get<{
    [delegate: string]: number
  }>(`${snapshotSpace.replace(".", "_")}-delegatedVoteWeight`)
