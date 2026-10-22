import type { PgTable } from 'drizzle-orm/pg-core';

export const dbWriteOperationValues = [
  'insert',
  'update',
  'insertOrUpdate',
  'insertOrDoNothing'
] as const;

export type DbWriteOperation = (typeof dbWriteOperationValues)[number];

export type DbEntityWriteConfig<Table extends PgTable> = {
  identityKey: Extract<keyof Table['$inferSelect'], string>;
  operations: DbWriteOperation[];
};
