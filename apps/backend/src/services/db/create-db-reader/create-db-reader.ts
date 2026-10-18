import { Result } from '@praha/byethrow';
import type { KnownKeysOnly } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import type { DbReadOptions } from '#backend/services/db/db-read-options';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';

export type DbReader<Table extends keyof Db['drizzle']['query'], Tab, Error> = {
  findFirst: <Config extends Omit<DbReadOptions<Table>, 'limit'>>(
    item?: KnownKeysOnly<Config, Omit<DbReadOptions<Table>, 'limit'>>
  ) => Result.ResultAsync<Tab, Error>;
  findMany: <Config extends DbReadOptions<Table>>(
    item?: KnownKeysOnly<Config, DbReadOptions<Table>>
  ) => Result.ResultAsync<Tab[], Error>;
};

export function createDbReader<
  Table extends keyof Db['drizzle']['query'],
  Ent,
  Tab,
  Error
>(item: {
  findFirst: (item?: Omit<DbReadOptions<Table>, 'limit'>) => PromiseLike<Ent>;
  findMany: (item?: DbReadOptions<Table>) => PromiseLike<Ent[]>;
  convert: (ent: Ent) => Result.Result<Tab, Error>;
}): DbReader<Table, Tab, Error> {
  let { findFirst, findMany, convert } = item;

  let reader: DbReader<Table, Tab, Error> = {
    findFirst: async <Config extends Omit<DbReadOptions<Table>, 'limit'>>(
      item?: KnownKeysOnly<Config, Omit<DbReadOptions<Table>, 'limit'>>
    ): Result.ResultAsync<Tab, Error> =>
      findFirst(item).then(x =>
        isUndefined(x) ? Result.succeed(undefined) : convert(x)
      ),
    findMany: async <Config extends DbReadOptions<Table>>(
      item?: KnownKeysOnly<Config, DbReadOptions<Table>>
    ): Result.ResultAsync<Tab[], Error> =>
      findMany(item).then(xs => Result.sequence(xs, x => convert(x)))
  };

  return reader;
}
