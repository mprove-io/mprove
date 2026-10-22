import type {
  DbTableTab,
  DbWriteTableKey
} from '#backend/services/db/db-table-types';

export type DbTabsPack = {
  [Key in DbWriteTableKey]?: DbTableTab<Key>[];
};
