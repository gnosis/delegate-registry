// Only to be used by the Vercel Serverless Function (not for Vercel Edge Functions)
import fetch from "node-fetch"
import {
  DelegateToDelegatorToVoteWeight,
  DelegateToVoteWeight,
} from "../../../types"
import { spaceNameToKey } from "./read"

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN!
if (VERCEL_API_TOKEN == null) {
  throw Error("VERCEL_API_TOKEN is not defined")
}

const EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID!
if (EDGE_CONFIG_ID == null) {
  throw Error("EDGE_CONFIG_ID is not defined")
}

const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID!
if (VERCEL_TEAM_ID == null) {
  throw Error("VERCEL_TEAM_ID is not defined")
}

export const storeDelegatedVoteWeight = async (
  snapshotSpace: string,
  delegatedVoteWeight: DelegateToVoteWeight,
  delegatedVoteWeightByDelegate: DelegateToDelegatorToVoteWeight,
) =>
  storeItems([
    {
      operation: "upsert",
      key: `${spaceNameToKey(snapshotSpace)}-updateTime`,
      value: Math.floor(Date.now() / 1000),
    },
    {
      operation: "upsert",
      key: `${spaceNameToKey(snapshotSpace)}-delegatedVoteWeight`,
      value: delegatedVoteWeight ?? {},
    },
    {
      operation: "upsert",
      key: `${spaceNameToKey(snapshotSpace)}-delegatedVoteWeightByAccount`,
      value: delegatedVoteWeightByDelegate ?? {},
    },
  ])

type EdgeConfigItem = {
  operation: "create" | "update" | "delete" | "upsert"
  key: string
  value: any
}

const storeItems = async (items: EdgeConfigItem[]) => {
  try {
    const updateEdgeConfig = await fetch(
      `https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items?teamId=${VERCEL_TEAM_ID}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${VERCEL_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
        }),
      },
    )
    const result = await updateEdgeConfig.json()
    return result
  } catch (error) {
    if (error instanceof Error) {
      console.log(
        `${error.name} error from Vercel when trying to save new data to Edge Config. Message: ${error.message}`,
      )
    }
  }
}
