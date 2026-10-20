import type { BackendSessionTypeIsNotExplorerError } from '#common/types/backend/errors/backend-session-type-is-not-explorer-error';
import type { BackendUnauthorizedError } from '#common/types/backend/errors/backend-unauthorized-error';
import type { DbSessionsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/sessions/db-sessions-find-first-check-exists-error';
import type { RebuildFromYamlError } from '#common/types/backend/function-errors/rebuild-from-yaml-error';
import type { RunQueriesError } from '#common/types/backend/function-errors/run-queries-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';

export type ProduceExplorerChartError =
  | DbSessionsFindFirstCheckExistsError
  | BackendUnauthorizedError
  | BackendSessionTypeIsNotExplorerError
  | RebuildFromYamlError
  | WriteError
  | RunQueriesError;
