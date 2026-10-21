import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Result } from '@praha/byethrow';
import type { BackendConfig } from '#backend/config/backend-config';
import { DbTabToEntConverter } from '#backend/services/db/db-tab-to-ent-converter';
import { DbTable } from '#backend/services/db/db-table';
import type {
  DbTableDefinitionMap,
  DbTableEnt,
  DbTableKey,
  DbTableNotFoundError,
  DbTableReadError,
  DbTableTab
} from '#backend/services/db/db-table-definition-map';
import type {
  DbTableReaderFindExists,
  DbTableReaderQuery
} from '#backend/services/db/db-table-reader';
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';

@Injectable()
export class DbTableFactoryService {
  readonly isEncryptDb: boolean;
  readonly isEncryptMetadata: boolean;

  constructor(
    private hashService: HashService,
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>
  ) {
    this.isEncryptDb = this.cs.get<BackendConfig['isEncryptDb']>('isEncryptDb');
    this.isEncryptMetadata =
      this.cs.get<BackendConfig['isEncryptMetadata']>('isEncryptMetadata');
  }

  create<Key extends DbTableKey>(item: {
    key: Key;
    query: DbTableReaderQuery<NoInfer<Key>>;
    findExists?: DbTableReaderFindExists<NoInfer<Key>>;
    defaultError: DbTableNotFoundError<NoInfer<Key>>;
    entToTab: (item: {
      ent: DbTableEnt<NoInfer<Key>>;
      tabService: TabService;
    }) => Result.Result<
      DbTableTab<NoInfer<Key>>,
      DbTableReadError<NoInfer<Key>>
    >;
    tabToEnt: (item: {
      tab: DbTableTab<NoInfer<Key>>;
      hashSecret?: string;
      hashService: HashService;
      tabService: TabService;
      isEncryptDb: boolean;
      isEncryptMetadata: boolean;
    }) => Result.Result<
      DbTableEnt<NoInfer<Key>>,
      DbTableDefinitionMap[NoInfer<Key>]['writeError']
    >;
  }): DbTable<Key> {
    let { key, query, findExists, defaultError, entToTab, tabToEnt } = item;

    let table: DbTable<Key> = new DbTable({
      key: key,
      query: query,
      findExists: findExists,
      defaultError: defaultError,
      entToTab: x => entToTab({ ent: x.ent, tabService: this.tabService }),
      tabToEnt: x =>
        tabToEnt({
          tab: x.tab,
          hashSecret: x.hashSecret,
          hashService: this.hashService,
          tabService: this.tabService,
          isEncryptDb: this.isEncryptDb,
          isEncryptMetadata: this.isEncryptMetadata
        })
    });

    return table;
  }

  createTabToEntConverter<Tab, Ent>(item: {
    tabToEnt: (item: {
      tab: Tab;
      hashService: HashService;
    }) => Result.Result<Ent, never>;
  }): DbTabToEntConverter<Tab, Ent, never> {
    let { tabToEnt } = item;

    let converter: DbTabToEntConverter<Tab, Ent, never> =
      new DbTabToEntConverter({
        tabToEnt: x => tabToEnt({ tab: x.tab, hashService: this.hashService })
      });

    return converter;
  }
}
