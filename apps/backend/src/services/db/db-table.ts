import { Result } from '@praha/byethrow';
import type {
  DBQueryConfig,
  ExtractTablesWithRelations,
  KnownKeysOnly
} from 'drizzle-orm';
import type { schemaPostgres } from '#backend/drizzle/postgres/schema/_schema-postgres';
import type {
  DbEntityRegistry,
  DbTableEnt,
  DbTableKey,
  DbTableNotFoundError,
  DbTableReadError,
  DbTableTab,
  DbTableWriteError
} from '#backend/services/db/db-entity-registry';
import type { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';

export type DbTableContext = {
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
};

type DbReadSchema = ExtractTablesWithRelations<typeof schemaPostgres>;

type DbTableReadOptions<Table extends keyof DbReadSchema> = Omit<
  DBQueryConfig<'many', true, DbReadSchema, DbReadSchema[Table]>,
  'columns' | 'with' | 'extras'
> & { columns?: never; with?: never; extras?: never };

type DbTableSchemaKey<Key extends DbTableKey> = `${Key}Table`;

type DbFindFirstOptions<Key extends DbTableKey> = Omit<
  DbTableReadOptions<DbTableSchemaKey<Key>>,
  'limit'
>;

type DbFindManyOptions<Key extends DbTableKey> = DbTableReadOptions<
  DbTableSchemaKey<Key>
>;

export type DbTableQuery<Key extends DbTableKey> = {
  findFirst: (item?: DbFindFirstOptions<Key>) => PromiseLike<DbTableEnt<Key>>;
  findMany: (item?: DbFindManyOptions<Key>) => PromiseLike<DbTableEnt<Key>[]>;
};

export type DbTableExistsQuery<Key extends DbTableKey> = {
  findFirst: (
    item: Omit<DbFindFirstOptions<Key>, 'columns'> & {
      columns: Record<string, true>;
    }
  ) => PromiseLike<unknown>;
};

export class DbTable<Key extends DbTableKey> {
  readonly entToTab: (item: {
    ent: DbTableEnt<Key>;
  }) => Result.Result<DbTableTab<Key>, DbTableReadError<Key>>;

  readonly tabToEnt: (item: {
    tab: DbTableTab<Key>;
    hashSecret?: string;
  }) => Result.Result<DbTableEnt<Key>, DbTableWriteError<Key>>;

  constructor(
    private readonly item: {
      query: DbTableQuery<Key>;
      existsQuery: DbTableExistsQuery<Key>;
      entityConfig: DbEntityRegistry[Key];
      context: DbTableContext;
    }
  ) {
    let { entityConfig, context } = item;

    this.entToTab = x =>
      entityConfig.entToTab({
        ent: x.ent,
        tabService: context.tabService
      });

    this.tabToEnt = x =>
      entityConfig.tabToEnt({
        tab: x.tab,
        hashSecret: x.hashSecret,
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
    return this.item.existsQuery
      .findFirst({
        ...item,
        columns: { [this.item.entityConfig.identityKey]: true }
      })
      .then(x => Result.succeed(isDefined(x)));
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
      .then<
        Result.Result<
          DbTableTab<Key>,
          DbTableReadError<Key> | DbTableNotFoundError<Key>
        >
      >(x =>
        isUndefined(x)
          ? Result.fail(this.item.entityConfig.notFoundError)
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
