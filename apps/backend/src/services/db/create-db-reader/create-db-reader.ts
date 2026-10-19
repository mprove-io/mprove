import { Result } from '@praha/byethrow';
import type { KnownKeysOnly } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import type { DbReadOptions } from '#backend/services/db/db-read-options';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { BackendError } from '#common/types/backend/errors/backend-error';

type DbDefaultReadOptions<Table extends keyof Db['drizzle']['query']> = Omit<
  DbReadOptions<Table>,
  'limit'
> & { error?: never };

export type DbReader<
  Table extends keyof Db['drizzle']['query'],
  Tab,
  Error extends { code: BackendError['code'] },
  DefaultError extends BackendError
> = {
  isExist: <Config extends Omit<DbReadOptions<Table>, 'limit'>>(
    item?: KnownKeysOnly<Config, Omit<DbReadOptions<Table>, 'limit'>>
  ) => Result.ResultAsync<boolean, never>;

  isExistUnwrap: <Config extends Omit<DbReadOptions<Table>, 'limit'>>(
    item?: KnownKeysOnly<Config, Omit<DbReadOptions<Table>, 'limit'>>
  ) => Promise<boolean>;

  findFirst: <Config extends Omit<DbReadOptions<Table>, 'limit'>>(
    item?: KnownKeysOnly<Config, Omit<DbReadOptions<Table>, 'limit'>>
  ) => Result.ResultAsync<Tab, Error>;

  findFirstCheckExists: {
    <Config extends DbDefaultReadOptions<Table>>(
      item: KnownKeysOnly<Config, DbDefaultReadOptions<Table>>
    ): Result.ResultAsync<Tab, Error | DefaultError>;
    <
      Config extends Omit<DbReadOptions<Table>, 'limit'> & {
        error: BackendError;
      }
    >(
      item: KnownKeysOnly<
        Config,
        Omit<DbReadOptions<Table>, 'limit'> & { error: BackendError }
      >
    ): Result.ResultAsync<Tab, Error | Config['error']>;
  };

  findFirstCheckExistsUnwrap: {
    <Config extends DbDefaultReadOptions<Table>>(
      item: KnownKeysOnly<Config, DbDefaultReadOptions<Table>>
    ): Promise<Tab>;
    <
      Config extends Omit<DbReadOptions<Table>, 'limit'> & {
        error: BackendError;
      }
    >(
      item: KnownKeysOnly<
        Config,
        Omit<DbReadOptions<Table>, 'limit'> & { error: BackendError }
      >
    ): Promise<Tab>;
  };

  findMany: <Config extends DbReadOptions<Table>>(
    item?: KnownKeysOnly<Config, DbReadOptions<Table>>
  ) => Result.ResultAsync<Tab[], Error>;

  findFirstUnwrap: <Config extends Omit<DbReadOptions<Table>, 'limit'>>(
    item?: KnownKeysOnly<Config, Omit<DbReadOptions<Table>, 'limit'>>
  ) => Promise<Tab>;

  findManyUnwrap: <Config extends DbReadOptions<Table>>(
    item?: KnownKeysOnly<Config, DbReadOptions<Table>>
  ) => Promise<Tab[]>;
};

export function createDbReader<
  Table extends keyof Db['drizzle']['query'],
  Ent,
  Tab,
  Error extends { code: BackendError['code'] },
  DefaultError extends BackendError
>(item: {
  findFirst: (item?: Omit<DbReadOptions<Table>, 'limit'>) => PromiseLike<Ent>;

  findExists?: (
    item?: Omit<DbReadOptions<Table>, 'limit'>
  ) => PromiseLike<unknown>;

  findMany: (item?: DbReadOptions<Table>) => PromiseLike<Ent[]>;

  convert: (ent: Ent) => Result.Result<Tab, Error>;

  defaultError: DefaultError;
}): DbReader<Table, Tab, Error, DefaultError> {
  let { findFirst, findExists, findMany, convert, defaultError } = item;

  function findFirstCheckExists<Config extends DbDefaultReadOptions<Table>>(
    item: KnownKeysOnly<Config, DbDefaultReadOptions<Table>>
  ): Result.ResultAsync<Tab, Error | DefaultError>;

  function findFirstCheckExists<
    Config extends Omit<DbReadOptions<Table>, 'limit'> & { error: BackendError }
  >(
    item: KnownKeysOnly<
      Config,
      Omit<DbReadOptions<Table>, 'limit'> & { error: BackendError }
    >
  ): Result.ResultAsync<Tab, Error | Config['error']>;

  async function findFirstCheckExists(
    item: Omit<DbReadOptions<Table>, 'limit'> & { error?: BackendError }
  ): Result.ResultAsync<Tab, Error | BackendError> {
    let { error, ...options } = item;

    let missingError: BackendError = error ?? defaultError;

    return findFirst(options).then(
      (x): Result.Result<Tab, Error | BackendError> =>
        isUndefined(x) ? Result.fail(missingError) : convert(x)
    );
  }

  function findFirstCheckExistsUnwrap<
    Config extends DbDefaultReadOptions<Table>
  >(item: KnownKeysOnly<Config, DbDefaultReadOptions<Table>>): Promise<Tab>;

  function findFirstCheckExistsUnwrap<
    Config extends Omit<DbReadOptions<Table>, 'limit'> & { error: BackendError }
  >(
    item: KnownKeysOnly<
      Config,
      Omit<DbReadOptions<Table>, 'limit'> & { error: BackendError }
    >
  ): Promise<Tab>;

  async function findFirstCheckExistsUnwrap(
    item: Omit<DbReadOptions<Table>, 'limit'> & { error?: BackendError }
  ): Promise<Tab> {
    let { error, ...options } = item;

    let result: Result.Result<Tab, Error | BackendError> =
      await findFirstCheckExists({
        ...options,
        error: error ?? defaultError
      });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let tab: Tab = result.value;

    return tab;
  }

  let reader: DbReader<Table, Tab, Error, DefaultError> = {
    isExist: async <Config extends Omit<DbReadOptions<Table>, 'limit'>>(
      item?: KnownKeysOnly<Config, Omit<DbReadOptions<Table>, 'limit'>>
    ): Result.ResultAsync<boolean, never> =>
      (findExists ?? findFirst)(item).then(x => Result.succeed(isDefined(x))),

    isExistUnwrap: async <Config extends Omit<DbReadOptions<Table>, 'limit'>>(
      item?: KnownKeysOnly<Config, Omit<DbReadOptions<Table>, 'limit'>>
    ): Promise<boolean> => {
      let result: Result.Result<boolean, never> = await reader.isExist(item);

      let isExist: boolean = Result.unwrap(result);

      return isExist;
    },

    findFirst: async <Config extends Omit<DbReadOptions<Table>, 'limit'>>(
      item?: KnownKeysOnly<Config, Omit<DbReadOptions<Table>, 'limit'>>
    ): Result.ResultAsync<Tab, Error> =>
      findFirst(item).then(x =>
        isUndefined(x) ? Result.succeed(undefined) : convert(x)
      ),
    findFirstCheckExists: findFirstCheckExists,

    findFirstCheckExistsUnwrap: findFirstCheckExistsUnwrap,

    findMany: async <Config extends DbReadOptions<Table>>(
      item?: KnownKeysOnly<Config, DbReadOptions<Table>>
    ): Result.ResultAsync<Tab[], Error> =>
      findMany(item).then(xs => Result.sequence(xs, x => convert(x))),

    findFirstUnwrap: async <Config extends Omit<DbReadOptions<Table>, 'limit'>>(
      item?: KnownKeysOnly<Config, Omit<DbReadOptions<Table>, 'limit'>>
    ): Promise<Tab> => {
      let result: Result.Result<Tab, Error> = await reader.findFirst(item);

      if (Result.isFailure(result)) {
        throw new ServerError({ message: result.error.code });
      }

      let tab: Tab = result.value;

      return tab;
    },

    findManyUnwrap: async <Config extends DbReadOptions<Table>>(
      item?: KnownKeysOnly<Config, DbReadOptions<Table>>
    ): Promise<Tab[]> => {
      let result: Result.Result<Tab[], Error> = await reader.findMany(item);

      if (Result.isFailure(result)) {
        throw new ServerError({ message: result.error.code });
      }

      let tabs: Tab[] = result.value;

      return tabs;
    }
  };

  return reader;
}
