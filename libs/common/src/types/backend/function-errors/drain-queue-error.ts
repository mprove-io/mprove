import type { DbErrorToError } from '#common/types/backend/function-errors/db/db-error-to-error';
import type { DbOcSessionsFindFirstError } from '#common/types/backend/function-errors/db/oc-sessions/db-oc-sessions-find-first-error';
import type { DbSessionsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/sessions/db-sessions-find-first-check-exists-error';

export type DrainQueueError =
  | DbOcSessionsFindFirstError
  | DbSessionsFindFirstCheckExistsError
  | DbErrorToError;
