import type { ExtractTablesWithRelations } from 'drizzle-orm';
import type { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { schemaPostgres } from '#backend/drizzle/postgres/schema/_schema-postgres';

export type DbTransaction = PgTransaction<
  NodePgQueryResultHKT,
  typeof schemaPostgres,
  ExtractTablesWithRelations<typeof schemaPostgres>
>;
