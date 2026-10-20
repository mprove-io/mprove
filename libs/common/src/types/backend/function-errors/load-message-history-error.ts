import type { DbOcMessagesFindManyError } from '#common/types/backend/function-errors/db/oc-messages/db-oc-messages-find-many-error';
import type { DbOcPartsFindManyError } from '#common/types/backend/function-errors/db/oc-parts/db-oc-parts-find-many-error';

export type LoadMessageHistoryError =
  | DbOcMessagesFindManyError
  | DbOcPartsFindManyError;
