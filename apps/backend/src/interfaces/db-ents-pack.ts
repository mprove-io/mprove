import type {
  DbTableEnt,
  DbWriteTableKey
} from '#backend/services/db/db-entity-registry';

export type DbEntsPack = {
  [Key in DbWriteTableKey]?: DbTableEnt<Key>[];
};
