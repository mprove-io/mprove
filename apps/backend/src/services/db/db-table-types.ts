import type { Result } from '@praha/byethrow';
import type { PgTable } from 'drizzle-orm/pg-core';
import type { schemaPostgres } from '#backend/drizzle/postgres/schema/_schema-postgres';
import type { dbEntityDefinition } from '#backend/services/db/db-entity-defs';
import type { DbTable } from '#backend/services/db/db-table';
import type { HashService } from '#backend/services/hash/hash.service';
import type { TabService } from '#backend/services/tab/tab.service';

type DbEntityDefinition = typeof dbEntityDefinition;

export type DbWriteTableKey = keyof DbEntityDefinition;

export type DbReadTableKey = {
  [Key in DbWriteTableKey]: DbEntityDefinition[Key] extends {
    entToTab: unknown;
  }
    ? Key
    : never;
}[DbWriteTableKey];

type DbWriteTypeMap = {
  [Key in DbWriteTableKey]: {
    ent: DbEntityDefinition[Key]['table']['$inferSelect'];
    tab: Parameters<DbEntityDefinition[Key]['tabToEnt']>[0]['tab'];
    writeError: Extract<
      ReturnType<DbEntityDefinition[Key]['tabToEnt']>,
      Result.Failure<unknown>
    >['error'];
  };
};

type DbReadTypeMap = {
  [Key in DbReadTableKey]: {
    readError: Extract<
      ReturnType<DbEntityDefinition[Key]['entToTab']>,
      Result.Failure<unknown>
    >['error'];
    notFoundError: DbEntityDefinition[Key]['defaultError'];
  };
};

export type DbTableEnt<Key extends DbWriteTableKey> =
  DbWriteTypeMap[Key]['ent'];

export type DbTableTab<Key extends DbWriteTableKey> =
  DbWriteTypeMap[Key]['tab'];

export type DbTableReadError<Key extends DbReadTableKey> =
  DbReadTypeMap[Key]['readError'];

export type DbTableWriteError<Key extends DbWriteTableKey> =
  DbWriteTypeMap[Key]['writeError'];

export type DbTableNotFoundError<Key extends DbReadTableKey> =
  DbReadTypeMap[Key]['notFoundError'];

export type DbExistsColumns<Table extends PgTable> = {
  [Column in keyof Table['$inferSelect']]?: true;
};

export type DbConverterContext = {
  hashService: HashService;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
};

export type DbWriteConverter<Key extends DbWriteTableKey> = {
  tabToEnt: (item: {
    tab: DbTableTab<Key>;
    hashSecret?: string;
  }) => Result.Result<DbTableEnt<Key>, DbTableWriteError<Key>>;
};

export type DbWriteConverterMap = {
  [Key in DbWriteTableKey]: DbWriteConverter<Key>;
};

export type DbWriteDefinitionMap = {
  [Key in DbWriteTableKey]: {
    table: (typeof schemaPostgres)[`${Key}Table`];
    tabToEnt: (item: {
      tab: DbTableTab<Key>;
      hashSecret?: string;
      hashService: HashService;
      tabService: TabService;
      isEncryptDb: boolean;
      isEncryptMetadata: boolean;
    }) => Result.Result<DbTableEnt<Key>, DbTableWriteError<Key>>;
  };
};

export type DbReadDefinitionMap = {
  [Key in DbReadTableKey]: {
    entToTab: (item: {
      ent: DbTableEnt<Key>;
      tabService: TabService;
    }) => Result.Result<DbTableTab<Key>, DbTableReadError<Key>>;
    tabToEnt: DbWriteDefinitionMap[Key]['tabToEnt'];
    defaultError: DbTableNotFoundError<Key>;
    existsColumns?: DbExistsColumns<DbEntityDefinition[Key]['table']>;
  };
};

export type DbTableMap = {
  [Key in DbWriteTableKey]: Key extends DbReadTableKey
    ? DbTable<Key>
    : DbWriteConverter<Key>;
};
