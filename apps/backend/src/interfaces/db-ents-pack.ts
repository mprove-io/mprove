import type {
  DbTableDefinitionMap,
  DbTableEnt
} from '#backend/services/db/db-table-definition-map';

export type DbEntsPack = {
  [Key in keyof DbTableDefinitionMap]?: DbTableEnt<Key>[];
};
