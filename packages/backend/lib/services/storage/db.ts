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

// Keys of this interface are table names.
export interface Database {
  delegation_snapshot: DelegationSnapshotTable
}

const db = createKysely<Database>()

const createDelegationSnapshotTable = async () => {
  await db.schema
    .createTable("delegation_snapshot")
    .ifNotExists()
    .addColumn("id", "serial", (cb) => cb.primaryKey())
    .addColumn("context", "text", (col) => col.notNull())
    .addColumn("main_chain_block_number", "integer")
    .addColumn("from_address", "text", (col) => col.notNull())
    .addColumn("to_address", "text", (col) => col.notNull())
    .addColumn("delegated_amount", "text", (col) => col.notNull())
    .addColumn("to_address_own_amount", "text", (col) => col.notNull())
    .execute()
}

const initDb = async () => {
  await createDelegationSnapshotTable()
}

const storeSnapshot = async (delegationSnapshot: DelegationSnapshot[]) => {
  await db
    .insertInto("delegation_snapshot")
    .values(delegationSnapshot)
    .execute()
}

const emptyLatestSnapshot = async (context: string) =>
  db
    .deleteFrom("delegation_snapshot")
    .where("context", "=", context)
    .where("main_chain_block_number", "=", null)
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

export {
  db,
  sql,
  initDb,
  storeSnapshot,
  emptyLatestSnapshot,
  getDelegationSnapshot,
}
