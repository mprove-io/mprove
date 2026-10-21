import type {
  DbTableDefinitionMap,
  DbTableTab
} from '#backend/services/db/db-table-definition-map';

export type DbTabsPack = {
  [Key in keyof DbTableDefinitionMap]?: DbTableTab<Key>[];
};
