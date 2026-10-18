import type { DBQueryConfig, ExtractTablesWithRelations } from 'drizzle-orm';
import type { schemaPostgres } from '#backend/drizzle/postgres/schema/_schema-postgres';

type ReadSchema = ExtractTablesWithRelations<typeof schemaPostgres>;

export type DbReadOptions<Table extends keyof ReadSchema> = Omit<
  DBQueryConfig<'many', true, ReadSchema, ReadSchema[Table]>,
  'columns' | 'with' | 'extras'
> & {
  columns?: never;
  with?: never;
  extras?: never;
};
