import { Result } from '@praha/byethrow';
import type {
  DBQueryConfig,
  ExtractTablesWithRelations,
  KnownKeysOnly
} from 'drizzle-orm';
import type { schemaPostgres } from '#backend/drizzle/postgres/schema/_schema-postgres';
import type {
  DbTableEnt,
  DbTableKey,
  DbTableNotFoundError,
  DbTableQueryErrorMap,
  DbTableReadError,
  DbTableTab
} from '#backend/services/db/db-table-definition-map';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';

type DbReadSchema = ExtractTablesWithRelations<typeof schemaPostgres>;

type DbTableReadOptions<Table extends keyof DbReadSchema> = Omit<
  DBQueryConfig<'many', true, DbReadSchema, DbReadSchema[Table]>,
  'columns' | 'with' | 'extras'
> & { columns?: never; with?: never; extras?: never };

type DbTableReaderTable<Key extends DbTableKey> = `${Key}Table`;

export type DbTableReaderQuery<Key extends DbTableKey> = {
  findFirst: (
    item?: Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
  ) => PromiseLike<DbTableEnt<Key>>;
  findMany: (
    item?: DbTableReadOptions<DbTableReaderTable<Key>>
  ) => PromiseLike<DbTableEnt<Key>[]>;
};

export type DbTableReaderFindExists<Key extends DbTableKey> = (
  item?: Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
) => PromiseLike<unknown>;

export class DbTableReader<Key extends DbTableKey> {
  constructor(
    private readonly item: {
      key: Key;
      query: DbTableReaderQuery<NoInfer<Key>>;
      findExists?: DbTableReaderFindExists<NoInfer<Key>>;
      convert: (
        ent: DbTableEnt<NoInfer<Key>>
      ) => Result.Result<
        DbTableTab<NoInfer<Key>>,
        DbTableReadError<NoInfer<Key>>
      >;
      defaultError: DbTableNotFoundError<NoInfer<Key>>;
    }
  ) {}

  async isExistUnwrap<
    Config extends Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
  >(
    item?: KnownKeysOnly<
      Config,
      Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
    >
  ): Promise<boolean> {
    let result: Result.Result<boolean, never> = await this.isExist(item);

    let isExist: boolean = Result.unwrap(result);

    return isExist;
  }

  async isExist<
    Config extends Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
  >(
    item?: KnownKeysOnly<
      Config,
      Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
    >
  ): Result.ResultAsync<boolean, never> {
    return (
      isDefined(this.item.findExists)
        ? this.item.findExists(item)
        : this.item.query.findFirst(item)
    ).then(x => Result.succeed(isDefined(x)));
  }

  async findFirstCheckExistsUnwrap<
    Config extends Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
  >(
    item: KnownKeysOnly<
      Config,
      Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
    >
  ): Promise<DbTableTab<Key>> {
    let result: Result.Result<
      DbTableTab<Key>,
      DbTableQueryErrorMap[Key]['findFirstCheckExists']
    > = await this.findFirstCheckExists(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let tab: DbTableTab<Key> = result.value;

    return tab;
  }

  async findFirstCheckExists<
    Config extends Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
  >(
    item: KnownKeysOnly<
      Config,
      Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
    >
  ): Result.ResultAsync<
    DbTableTab<Key>,
    DbTableQueryErrorMap[Key]['findFirstCheckExists']
  > {
    return this.item.query
      .findFirst(item)
      .then(
        async (
          x: DbTableEnt<Key>
        ): Result.ResultAsync<
          DbTableTab<Key>,
          DbTableQueryErrorMap[Key]['findFirstCheckExists']
        > =>
          isUndefined(x)
            ? await Result.fail(this.item.defaultError)
            : this.item.convert(x)
      );
  }

  async findFirstUnwrap<
    Config extends Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
  >(
    item?: KnownKeysOnly<
      Config,
      Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
    >
  ): Promise<DbTableTab<Key>> {
    let result: Result.Result<
      DbTableTab<Key>,
      DbTableQueryErrorMap[Key]['findFirst']
    > = await this.findFirst(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let tab: DbTableTab<Key> = result.value;

    return tab;
  }

  async findFirst<
    Config extends Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
  >(
    item?: KnownKeysOnly<
      Config,
      Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
    >
  ): Result.ResultAsync<
    DbTableTab<Key>,
    DbTableQueryErrorMap[Key]['findFirst']
  > {
    return this.item.query
      .findFirst(item)
      .then(x =>
        isUndefined(x) ? Result.succeed(undefined) : this.item.convert(x)
      );
  }

  async findManyUnwrap<
    Config extends DbTableReadOptions<DbTableReaderTable<Key>>
  >(
    item?: KnownKeysOnly<Config, DbTableReadOptions<DbTableReaderTable<Key>>>
  ): Promise<DbTableTab<Key>[]> {
    let result: Result.Result<
      DbTableTab<Key>[],
      DbTableQueryErrorMap[Key]['findMany']
    > = await this.findMany(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let tabs: DbTableTab<Key>[] = result.value;

    return tabs;
  }

  async findMany<Config extends DbTableReadOptions<DbTableReaderTable<Key>>>(
    item?: KnownKeysOnly<Config, DbTableReadOptions<DbTableReaderTable<Key>>>
  ): Result.ResultAsync<
    DbTableTab<Key>[],
    DbTableQueryErrorMap[Key]['findMany']
  > {
    return this.item.query
      .findMany(item)
      .then(xs => Result.sequence(xs, x => this.item.convert(x)));
  }
}
