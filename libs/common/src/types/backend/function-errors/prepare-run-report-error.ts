import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendReportNotFoundError,
  zBackendReportNotFoundError
} from '#common/types/backend/errors/backend-report-not-found-error';
import {
  type DbReportsFindManyError,
  zDbReportsFindManyError
} from '#common/types/backend/function-errors/db/reports/db-reports-find-many-error';

export type PrepareRunReportError =
  | BackendReportNotFoundError
  | DbReportsFindManyError;

export const zPrepareRunReportError = z.union([
  zBackendReportNotFoundError,
  zDbReportsFindManyError
]);

assertTypesEqual<PrepareRunReportError, z.infer<typeof zPrepareRunReportError>>(
  { value: true }
);
