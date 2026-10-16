import type { BuildCodexFetchError } from '#common/types/backend/function-errors/build-codex-fetch-error';
import type { GetExplorerModelError } from '#common/types/backend/function-errors/get-explorer-model-error';
import type { GetExplorerModelPartsError } from '#common/types/backend/function-errors/get-explorer-model-parts-error';
import type { GetModelSelectionError } from '#common/types/backend/function-errors/get-model-selection-error';
import type { GetProjectCheckExistsError } from '#common/types/backend/function-errors/get-project-check-exists-error';
import type { GetSessionByIdCheckExistsError } from '#common/types/backend/function-errors/get-session-by-id-check-exists-error';
import type { GetStructCheckExistsError } from '#common/types/backend/function-errors/get-struct-check-exists-error';
import type { GetUserCheckExistsError } from '#common/types/backend/function-errors/get-user-check-exists-error';
import type { LoadMessageHistoryError } from '#common/types/backend/function-errors/load-message-history-error';

export type RunProducerError =
  | LoadMessageHistoryError
  | GetSessionByIdCheckExistsError
  | GetUserCheckExistsError
  | GetModelSelectionError
  | GetProjectCheckExistsError
  | GetStructCheckExistsError
  | GetExplorerModelPartsError
  | BuildCodexFetchError
  | GetExplorerModelError;
