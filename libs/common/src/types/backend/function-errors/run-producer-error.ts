import type { BuildCodexFetchError } from '#common/types/backend/function-errors/build-codex-fetch-error';
import type { DbBridgesFindFirstError } from '#common/types/backend/function-errors/db/bridges/db-bridges-find-first-error';
import type { DbProjectsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/projects/db-projects-find-first-check-exists-error';
import type { DbSessionsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/sessions/db-sessions-find-first-check-exists-error';
import type { GetExplorerModelError } from '#common/types/backend/function-errors/get-explorer-model-error';
import type { GetExplorerModelPartsError } from '#common/types/backend/function-errors/get-explorer-model-parts-error';
import type { GetProviderModelSelectionError } from '#common/types/backend/function-errors/get-provider-model-selection-error';
import type { GetStructCheckExistsError } from '#common/types/backend/function-errors/get-struct-check-exists-error';
import type { GetUserCheckExistsError } from '#common/types/backend/function-errors/get-user-check-exists-error';
import type { LoadMessageHistoryError } from '#common/types/backend/function-errors/load-message-history-error';

export type RunProducerError =
  | DbBridgesFindFirstError
  | LoadMessageHistoryError
  | DbSessionsFindFirstCheckExistsError
  | GetUserCheckExistsError
  | GetProviderModelSelectionError
  | DbProjectsFindFirstCheckExistsError
  | GetStructCheckExistsError
  | GetExplorerModelPartsError
  | BuildCodexFetchError
  | GetExplorerModelError;
