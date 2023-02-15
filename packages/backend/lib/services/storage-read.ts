// To be used by the Vercel Edge Function
import { get } from "@vercel/edge-config"

export const getDelegatedVoteWeight = async (snapshotSpace: string) => {
  return get(snapshotSpace)
}
