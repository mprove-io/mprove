import { Result } from '@praha/byethrow';
import type {
  DbTableDefinitionMap,
  DbTableEnt,
  DbTableKey,
  DbTableNotFoundError,
  DbTableReadError,
  DbTableTab
} from '#backend/services/db/db-table-definition-map';
import {
  DbTableReader,
  type DbTableReaderFindExists,
  type DbTableReaderQuery
} from '#backend/services/db/db-table-reader';
import { ServerError } from '#common/classes/server-error/server-error';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';

export class DbTable<Key extends DbTableKey> extends DbTableReader<Key> {
  readonly entToTab: (item: {
    ent: DbTableEnt<Key>;
  }) => Result.Result<DbTableTab<Key>, DbTableReadError<Key>>;

  readonly tabToEnt: (item: {
    tab: DbTableTab<Key>;
    hashSecret?: string;
  }) => Result.Result<DbTableEnt<Key>, DbTableDefinitionMap[Key]['writeError']>;

  constructor(item: {
    key: Key;
    query: DbTableReaderQuery<NoInfer<Key>>;
    findExists?: DbTableReaderFindExists<NoInfer<Key>>;
    defaultError: DbTableNotFoundError<NoInfer<Key>>;
    entToTab: (item: {
      ent: DbTableEnt<NoInfer<Key>>;
    }) => Result.Result<
      DbTableTab<NoInfer<Key>>,
      DbTableReadError<NoInfer<Key>>
    >;
    tabToEnt: (item: {
      tab: DbTableTab<NoInfer<Key>>;
      hashSecret?: string;
    }) => Result.Result<
      DbTableEnt<NoInfer<Key>>,
      DbTableDefinitionMap[NoInfer<Key>]['writeError']
    >;
  }) {
    let { key, query, findExists, defaultError, entToTab, tabToEnt } = item;

    super({
      key: key,
      query: query,
      findExists: findExists,
      defaultError: defaultError,
      convert: ent => entToTab({ ent: ent })
    });

    this.entToTab = entToTab;
    this.tabToEnt = tabToEnt;
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
}
