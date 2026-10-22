import type {
  DbTableEnt,
  DbWriteTableKey
} from '#backend/services/db/db-table-types';

export type DbEntsPack = {
  [Key in DbWriteTableKey]?: DbTableEnt<Key>[];
};
