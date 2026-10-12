import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendReportNotFoundError,
  zBackendReportNotFoundError
} from '#common/types/backend/errors/backend-report-not-found-error';
import {
  type ReportEntToTabError,
  zReportEntToTabError
} from '#common/types/backend/function-errors/report-ent-to-tab-error';

export type PrepareRunReportError =
  | ReportEntToTabError
  | BackendReportNotFoundError;

export const zPrepareRunReportError = z.union([
  zReportEntToTabError,
  zBackendReportNotFoundError
]);

assertTypesEqual<PrepareRunReportError, z.infer<typeof zPrepareRunReportError>>(
  { value: true }
);
