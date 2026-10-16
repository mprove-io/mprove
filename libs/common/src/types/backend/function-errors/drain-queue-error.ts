import type { DbErrorToError } from '#common/types/backend/function-errors/db-error-to-error';
import type { GetOcSessionBySessionIdError } from '#common/types/backend/function-errors/get-oc-session-by-session-id-error';
import type { GetSessionByIdCheckExistsError } from '#common/types/backend/function-errors/get-session-by-id-check-exists-error';

export type DrainQueueError =
  | GetOcSessionBySessionIdError
  | GetSessionByIdCheckExistsError
  | DbErrorToError;
