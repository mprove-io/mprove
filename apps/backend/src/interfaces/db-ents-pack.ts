import type {
  DbTableEnt,
  DbTableKey
} from '#backend/services/db/db-entity-registry';

export type DbEntsPack = {
  [Key in DbTableKey]?: DbTableEnt<Key>[];
};
