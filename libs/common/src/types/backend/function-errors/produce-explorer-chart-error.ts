import type { BackendSessionTypeIsNotExplorerError } from '#common/types/backend/errors/backend-session-type-is-not-explorer-error';
import type { BackendUnauthorizedError } from '#common/types/backend/errors/backend-unauthorized-error';
import type { DbErrorToError } from '#common/types/backend/function-errors/db-error-to-error';
import type { GetSessionByIdCheckExistsError } from '#common/types/backend/function-errors/get-session-by-id-check-exists-error';
import type { RebuildFromYamlError } from '#common/types/backend/function-errors/rebuild-from-yaml-error';
import type { RunQueriesError } from '#common/types/backend/function-errors/run-queries-error';

export type ProduceExplorerChartError =
  | GetSessionByIdCheckExistsError
  | BackendUnauthorizedError
  | BackendSessionTypeIsNotExplorerError
  | RebuildFromYamlError
  | DbErrorToError
  | RunQueriesError;
