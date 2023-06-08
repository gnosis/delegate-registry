// return global stats for a given snapshot space.

import type { VercelRequest, VercelResponse } from "@vercel/node"
import { db } from "../../../../lib/services/storage/db"
import { BigNumber } from "ethers"
const { count, sum } = db.fn

export default async function getSpaceStats(
  request: VercelRequest,
  response: VercelResponse,
) {
  const space = request.query.space as string

  const numberOfDelegationsPromise = db
    .selectFrom("delegation_snapshot")
    .where("context", "=", space)
    .where("main_chain_block_number", "is", null)
    .select(count("id").as("numberOfDelegations"))
    .executeTakeFirst()

  const numberOfDelegatesPromise = await db
    .selectFrom((eb) =>
      eb
        .selectFrom("delegation_snapshot")
        .where("context", "=", space)
        .where("main_chain_block_number", "is", null)
        .select("to_address")
        .distinct()
        .as("inner"),
    )
    .select(count("inner.to_address" as any).as("numberOfDelegates"))
    .executeTakeFirst()

  const numberOfDelegatorsPromise = await db
    .selectFrom((eb) =>
      eb
        .selectFrom("delegation_snapshot")
        .where("context", "=", space)
        .where("main_chain_block_number", "is", null)
        .select("from_address")
        .distinct()
        .as("inner"),
    )
    .select(count("inner.from_address" as any).as("numberOfDelegators"))
    .executeTakeFirst()

  const [numberOfDelegations, numberOfDelegates, numberOfDelegators] =
    await Promise.all([
      numberOfDelegationsPromise,
      numberOfDelegatesPromise,
      numberOfDelegatorsPromise,
    ])

  response.status(200).json({
    success: "true",
    ...numberOfDelegations,
    ...numberOfDelegates,
    ...numberOfDelegators,
  })
}
