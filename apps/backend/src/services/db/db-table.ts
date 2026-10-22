import { Result } from '@praha/byethrow';
import type {
  DBQueryConfig,
  ExtractTablesWithRelations,
  KnownKeysOnly
} from 'drizzle-orm';
import type { schemaPostgres } from '#backend/drizzle/postgres/schema/_schema-postgres';
import type {
  DbConverterContext,
  DbReadDefinitionMap,
  DbReadTableKey,
  DbTableEnt,
  DbTableNotFoundError,
  DbTableReadError,
  DbTableTab,
  DbWriteConverter
} from '#backend/services/db/db-table-types';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';

type DbReadSchema = ExtractTablesWithRelations<typeof schemaPostgres>;

type DbTableReadOptions<Table extends keyof DbReadSchema> = Omit<
  DBQueryConfig<'many', true, DbReadSchema, DbReadSchema[Table]>,
  'columns' | 'with' | 'extras'
> & { columns?: never; with?: never; extras?: never };

type DbTableSchemaKey<Key extends DbReadTableKey> = `${Key}Table`;

type DbFindFirstOptions<Key extends DbReadTableKey> = Omit<
  DbTableReadOptions<DbTableSchemaKey<Key>>,
  'limit'
>;

type DbFindManyOptions<Key extends DbReadTableKey> = DbTableReadOptions<
  DbTableSchemaKey<Key>
>;

export type DbTableQuery<Key extends DbReadTableKey> = {
  findFirst: (item?: DbFindFirstOptions<Key>) => PromiseLike<DbTableEnt<Key>>;
  findMany: (item?: DbFindManyOptions<Key>) => PromiseLike<DbTableEnt<Key>[]>;
};

export type DbTableExistsQuery<Key extends DbReadTableKey> = {
  findFirst: (
    item: Omit<DbFindFirstOptions<Key>, 'columns'> & {
      columns: DbReadDefinitionMap[Key]['existsColumns'];
    }
  ) => PromiseLike<unknown>;
};

export class DbTable<Key extends DbReadTableKey>
  implements DbWriteConverter<Key>
{
  readonly entToTab: (item: {
    ent: DbTableEnt<Key>;
  }) => Result.Result<DbTableTab<Key>, DbTableReadError<Key>>;

  readonly tabToEnt: DbWriteConverter<Key>['tabToEnt'];

  constructor(
    private readonly item: {
      key: Key;
      query: DbTableQuery<NoInfer<Key>>;
      existsQuery: DbTableExistsQuery<NoInfer<Key>>;
      definition: DbReadDefinitionMap[NoInfer<Key>];
      context: DbConverterContext;
    }
  ) {
    let { definition, context } = item;

    this.entToTab = x =>
      definition.entToTab({
        ent: x.ent,
        tabService: context.tabService
      });

    this.tabToEnt = x =>
      definition.tabToEnt({
        tab: x.tab,
        hashSecret: x.hashSecret,
        hashService: context.hashService,
        tabService: context.tabService,
        isEncryptDb: context.isEncryptDb,
        isEncryptMetadata: context.isEncryptMetadata
      });
  }

  entToTabUnwrap(item: { ent?: DbTableEnt<Key> }): DbTableTab<Key> {
    let { ent } = item;

    if (isUndefined(ent)) {
      return;
    }

    let result: Result.Result<
      DbTableTab<Key>,
      DbTableReadError<Key>
    > = this.entToTab({ ent: ent });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let tab: DbTableTab<Key> = result.value;

    return tab;
  }

  async isExistUnwrap<Config extends DbFindFirstOptions<Key>>(
    item?: KnownKeysOnly<Config, DbFindFirstOptions<Key>>
  ): Promise<boolean> {
    let result: Result.Result<boolean, never> = await this.isExist(item);

    let isExist: boolean = Result.unwrap(result);

    return isExist;
  }

  async isExist<Config extends DbFindFirstOptions<Key>>(
    item?: KnownKeysOnly<Config, DbFindFirstOptions<Key>>
  ): Result.ResultAsync<boolean, never> {
    return (
      isDefined(this.item.definition.existsColumns)
        ? this.item.existsQuery.findFirst({
            ...item,
            columns: this.item.definition.existsColumns
          })
        : this.item.query.findFirst(item)
    ).then(x => Result.succeed(isDefined(x)));
  }

  async findFirstCheckExistsUnwrap<Config extends DbFindFirstOptions<Key>>(
    item: KnownKeysOnly<Config, DbFindFirstOptions<Key>>
  ): Promise<DbTableTab<Key>> {
    let result: Result.Result<
      DbTableTab<Key>,
      DbTableReadError<Key> | DbTableNotFoundError<Key>
    > = await this.findFirstCheckExists(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let tab: DbTableTab<Key> = result.value;

    return tab;
  }

  async findFirstCheckExists<Config extends DbFindFirstOptions<Key>>(
    item: KnownKeysOnly<Config, DbFindFirstOptions<Key>>
  ): Result.ResultAsync<
    DbTableTab<Key>,
    DbTableReadError<Key> | DbTableNotFoundError<Key>
  > {
    return this.item.query
      .findFirst(item)
      .then(
        async (
          x: DbTableEnt<Key>
        ): Result.ResultAsync<
          DbTableTab<Key>,
          DbTableReadError<Key> | DbTableNotFoundError<Key>
        > =>
          isUndefined(x)
            ? await Result.fail(this.item.definition.defaultError)
            : this.entToTab({ ent: x })
      );
  }

  async findFirstUnwrap<Config extends DbFindFirstOptions<Key>>(
    item?: KnownKeysOnly<Config, DbFindFirstOptions<Key>>
  ): Promise<DbTableTab<Key>> {
    let result: Result.Result<
      DbTableTab<Key>,
      DbTableReadError<Key>
    > = await this.findFirst(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let tab: DbTableTab<Key> = result.value;

    return tab;
  }

  async findFirst<Config extends DbFindFirstOptions<Key>>(
    item?: KnownKeysOnly<Config, DbFindFirstOptions<Key>>
  ): Result.ResultAsync<DbTableTab<Key>, DbTableReadError<Key>> {
    return this.item.query
      .findFirst(item)
      .then(x =>
        isUndefined(x) ? Result.succeed(undefined) : this.entToTab({ ent: x })
      );
  }

  async findManyUnwrap<Config extends DbFindManyOptions<Key>>(
    item?: KnownKeysOnly<Config, DbFindManyOptions<Key>>
  ): Promise<DbTableTab<Key>[]> {
    let result: Result.Result<
      DbTableTab<Key>[],
      DbTableReadError<Key>
    > = await this.findMany(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let tabs: DbTableTab<Key>[] = result.value;

    return tabs;
  }

  async findMany<Config extends DbFindManyOptions<Key>>(
    item?: KnownKeysOnly<Config, DbFindManyOptions<Key>>
  ): Result.ResultAsync<DbTableTab<Key>[], DbTableReadError<Key>> {
    return this.item.query
      .findMany(item)
      .then(xs => Result.sequence(xs, x => this.entToTab({ ent: x })));
  }
}
