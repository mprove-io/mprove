import type {
  DbTableKey,
  DbTableReadError
} from '#backend/services/db/db-entity-registry';
import type { BackendDbServerTsIsInFutureError } from '#common/types/backend/errors/backend-db-server-ts-is-in-future-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';

export type RewriteTableRecordsError =
  | DbTableReadError<DbTableKey>
  | WriteError
  | BackendDbServerTsIsInFutureError
  | {
      code: 'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV';
      customData: {
        table: string;
        count: number;
      };
    };
