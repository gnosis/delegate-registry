import { sql, Generated } from "kysely"
import { createKysely } from "@vercel/postgres-kysely"

type PromiseType<T extends Promise<any>> = T extends Promise<infer U>
  ? U
  : never
type ArrayElementType<T extends any[]> = T extends (infer U)[] ? U : never

export type DelegationSnapshot = ArrayElementType<
  PromiseType<ReturnType<typeof getDelegationSnapshot>>
>
interface DelegationSnapshotTable {
  id: Generated<number> // primary key
  context: string
  main_chain_block_number: number | null // null if its the current delegation (will be replaced on the next update)
  from_address: string
  to_address: string
  delegated_amount: string // vote weight delegated from from_address to to_address (this is the amount from_address has + the amount delegated to from_address)
  to_address_own_amount: string // to_address's own vote weight
}

interface ExcisingSnapshots {
  id: Generated<number> // primary key
  context: string
  main_chain_block_number: number
}

// Keys of this interface are table names.
export interface Database {
  excising_snapshots: ExcisingSnapshots
  delegation_snapshot: DelegationSnapshotTable
}

const db = createKysely<Database>()

const createExcisingSnapshotsTable = async () => {
  await db.schema
    .createTable("excising_snapshots")
    .ifNotExists()
    .addColumn("id", "serial", (cb) => cb.primaryKey())
    .addColumn("context", "text", (col) => col.notNull())
    .addColumn("main_chain_block_number", "bigint", (col) => col.notNull())
    .execute()
}

const createDelegationSnapshotTable = async () => {
  await db.schema
    .createTable("delegation_snapshot")
    .ifNotExists()
    .addColumn("id", "serial", (cb) => cb.primaryKey())
    .addColumn("context", "text", (col) => col.notNull())
    .addColumn("main_chain_block_number", "bigint")
    .addColumn("from_address", "text", (col) => col.notNull())
    .addColumn("to_address", "text", (col) => col.notNull())
    .addColumn("delegated_amount", "numeric(40)" as any, (col) => col.notNull()) // numeric(35
    .addColumn("to_address_own_amount", "numeric(40)" as any, (col) =>
      col.notNull(),
    )
    .execute()
}

const initDb = async () => {
  await createExcisingSnapshotsTable()
  await createDelegationSnapshotTable()
}

const addSnapshotToTheExcisingSnapshotTable = async (
  context: string,
  main_chain_block_number: number,
) =>
  db
    .insertInto("excising_snapshots")
    .values({ context, main_chain_block_number })
    .execute()

const checkIfSnapshotExists = async (
  context: string,
  main_chain_block_number: number,
) => {
  const res = await db
    .selectFrom("excising_snapshots")
    .where("context", "=", context)
    .where("main_chain_block_number", "=", main_chain_block_number)
    .execute()

  return res.length > 0 ? true : false
}

const storeSnapshot = async (delegationSnapshot: DelegationSnapshot[]) => {
  const context = delegationSnapshot[0].context
  const main_chain_block_number = delegationSnapshot[0]?.main_chain_block_number
  const parallelDbWrites: Promise<any>[] = []
  if (main_chain_block_number != null) {
    if (!(await checkIfSnapshotExists(context, main_chain_block_number))) {
      console.warn(
        "This snapshot is not stored in the `excising_snapshots`. We store it here automatically. But if this is not fixed empty snapshots will be recomputed on every request.",
      )
      parallelDbWrites.push(
        addSnapshotToTheExcisingSnapshotTable(context, main_chain_block_number),
      )
    }
  }
  parallelDbWrites.push(
    db.insertInto("delegation_snapshot").values(delegationSnapshot).execute(),
  )
  await Promise.all(parallelDbWrites)
}

const deleteLatestSnapshot = async (context: string) =>
  db
    .deleteFrom("delegation_snapshot")
    .where("context", "=", context)
    .where("main_chain_block_number", "is", null)
    .execute()

const getDelegationSnapshot = async (
  context: string,
  main_chain_block_number: number | null,
) =>
  db
    .selectFrom("delegation_snapshot")
    .where("context", "=", context)
    .where("main_chain_block_number", "=", main_chain_block_number)
    .select([
      "context",
      "main_chain_block_number",
      "from_address",
      "to_address",
      "delegated_amount",
      "to_address_own_amount",
    ])
    .execute()

const { sum } = db.fn

/*
    Returns the vote weight snapshot for the given context and main_chain_block_number.
    The vote weight snapshot is the sum of all vote weights delegated to each account.
    Accounts that have delegated to other accounts has delegated_to_count > 0.
*/
const getVoteWeightSnapshot = async (
  context: string,
  main_chain_block_number: number | null,
) =>
  db
    .selectFrom("delegation_snapshot")
    .leftJoin(
      (eb) =>
        eb
          .selectFrom("delegation_snapshot")
          .select("from_address")
          .where("context", "=", context)
          .where("main_chain_block_number", "=", main_chain_block_number)
          .as("delegators"),
      (join) =>
        join.onRef(
          "delegators.from_address",
          "=",
          "delegation_snapshot.to_address",
        ),
    )
    .where("context", "=", context)
    .where("main_chain_block_number", "=", main_chain_block_number)
    // .where("to_address", "not in", (qb) =>
    //   // select all accounts that have delegated to other accounts
    //   qb
    //     .selectFrom("delegation_snapshot")
    //     .select("from_address")
    //     .where("context", "=", context)
    //     .where("main_chain_block_number", "=", main_chain_block_number),
    // )
    .select("to_address")
    .select(sum("delegated_amount").as("delegated_amount"))
    .select(sum("to_address_own_amount").as("to_address_own_amount"))
    // .select("delegators.from_address")
    .select((eb) =>
      eb.fn.count("delegators.from_address").as("delegated_to_count"),
    )
    .groupBy("to_address")
    .execute()

// select all to_accounts that have delegated to other accounts
// select to_Address where to_address in (select from_address from delegation_snapshot where context = 'mainnet' and main_chain_block_number = 1234)

export {
  db,
  sql,
  initDb,
  storeSnapshot,
  deleteLatestSnapshot,
  getDelegationSnapshot,
  addSnapshotToTheExcisingSnapshotTable,
  checkIfSnapshotExists,
  getVoteWeightSnapshot,
}
