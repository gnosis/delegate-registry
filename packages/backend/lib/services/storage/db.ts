import { ColumnType, sql, Generated } from "kysely"
import { createKysely } from "@vercel/postgres-kysely"

interface DelegationSetTable {
  id: Generated<number> // primary key
  context: string // snapshot space
  created_at: ColumnType<Date, string | undefined, never>
  from_address: string
  chain_id: number
  block_number: number
  expiration_timestamp: number
  activation_timestamp: number
  deactivation_timestamp: number | null
}

interface DelegationTable {
  id: Generated<number> // primary key
  id_delegation_set: string // foreign key
  to_address: string
  numerator: number
}

interface OptOutsTable {
  id: Generated<number> // primary key
  context: string // snapshot space
  address: string
  created_at: ColumnType<Date, string | undefined, never>
  chain_id: number
  block_number: number
  activation_timestamp: number
  deactivation_timestamp: number | null
}

interface DelegationSnapshotTable {
  id: Generated<number> // primary key
  context: string
  main_chain_block_number: number | null // null if its the current delegation (will be replaced on the next update)
  from_address: string
  to_address: string
  delegated_amount: number // vote weight delegated from from_address to to_address (this is the amount from_address has + the amount delegated to from_address)
  to_address_own_amount: number // to_address's own vote weight
}

// Keys of this interface are table names.
export interface Database {
  delegationSetTable: DelegationSetTable
  delegationTable: DelegationTable
  optOutsTable: OptOutsTable
  delegationSnapshotTable: DelegationSnapshotTable
}

const db = createKysely<Database>()

const createDelegationSetTable = async () => {
  await db.schema
    .createTable("delegation_set")
    .ifNotExists()
    .addColumn("id", "serial", (cb) => cb.primaryKey())
    .addColumn("context", "text", (col) => col.notNull())
    .addColumn("created_at", sql`timestamp with time zone`, (cb) =>
      cb.defaultTo(sql`current_timestamp`),
    )
    .addColumn("from_address", "text", (col) => col.notNull())
    .addColumn("chain_id", "integer", (col) => col.notNull())
    .addColumn("block_number", "integer", (col) => col.notNull())
    .addColumn("expiration_timestamp", "integer", (col) => col.notNull())
    .addColumn("activation_timestamp", "integer", (col) => col.notNull())
    .addColumn("deactivation_timestamp", "integer")
    .execute()
}

const createDelegationTable = async () => {
  await db.schema
    .createTable("delegation")
    .ifNotExists()
    .addColumn("id", "serial", (cb) => cb.primaryKey())
    .addColumn("id_delegation_set", "integer", (col) =>
      col.notNull().references("delegation_set.id"),
    )
    .addColumn("to_address", "text", (col) => col.notNull())
    .addColumn("numerator", "integer", (col) => col.notNull())
    .execute()
}

const createOptOutsTable = async () => {
  await db.schema
    .createTable("opt_outs")
    .ifNotExists()
    .addColumn("id", "serial", (cb) => cb.primaryKey())
    .addColumn("context", "text", (col) => col.notNull())
    .addColumn("address", "text", (col) => col.notNull())
    .addColumn("created_at", sql`timestamp with time zone`, (cb) =>
      cb.defaultTo(sql`current_timestamp`),
    )
    .addColumn("chain_id", "integer", (col) => col.notNull())
    .addColumn("block_number", "integer", (col) => col.notNull())
    .addColumn("activation_timestamp", "integer", (col) => col.notNull())
    .addColumn("deactivation_timestamp", "integer")
    .execute()
}

const createDelegationSnapshotTable = async () => {
  await db.schema
    .createTable("delegation_snapshot")
    .ifNotExists()
    .addColumn("id", "serial", (cb) => cb.primaryKey())
    .addColumn("context", "text", (col) => col.notNull())
    .addColumn("main_chain_block_number", "integer")
    .addColumn("from_address", "text", (col) => col.notNull())
    .addColumn("to_address", "text", (col) => col.notNull())
    .addColumn("delegated_amount", "integer", (col) => col.notNull())
    .addColumn("to_address_own_amount", "integer", (col) => col.notNull())
    .execute()
}

const initDb = async () => {
  await createDelegationSetTable()
  await createDelegationTable()
  await createOptOutsTable()
  await createDelegationSnapshotTable()
}

export { db, sql, initDb }
