import type {
  DbTableKey,
  DbTableTab
} from '#backend/services/db/db-entity-registry';

export type DbTabsPack = {
  [Key in DbTableKey]?: DbTableTab<Key>[];
};
