import type {
  DbTableTab,
  DbWriteTableKey
} from '#backend/services/db/db-entity-registry';

export type DbTabsPack = {
  [Key in DbWriteTableKey]?: DbTableTab<Key>[];
};
