import type { Result } from '@praha/byethrow';
import type {
  DbTableDefinitionMap,
  DbTableEnt,
  DbTableTab,
  DbTableWriteError
} from '#backend/services/db/db-table-definition-map';

export type DbTableRegistryLike = {
  [Key in keyof DbTableDefinitionMap]: {
    tabToEnt: (item: {
      tab: DbTableTab<Key>;
      hashSecret?: string;
    }) => Result.Result<DbTableEnt<Key>, DbTableWriteError<Key>>;
  };
};
