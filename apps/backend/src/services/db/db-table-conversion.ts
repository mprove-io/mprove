import type {
  DbTableEnt,
  DbTableKey
} from '#backend/services/db/db-entity-registry';

export type DbTableConversion<Key extends DbTableKey = DbTableKey> = {
  [TableKey in Key]: {
    key: TableKey;
    ents: DbTableEnt<TableKey>[];
  };
}[Key];
