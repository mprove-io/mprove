import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendForbiddenReportError,
  zBackendForbiddenReportError
} from '#common/types/backend/errors/backend-forbidden-report-error';
import {
  type BackendReportCreatorIdMismatchError,
  zBackendReportCreatorIdMismatchError
} from '#common/types/backend/errors/backend-report-creator-id-mismatch-error';
import {
  type BackendReportNotFoundError,
  zBackendReportNotFoundError
} from '#common/types/backend/errors/backend-report-not-found-error';
import {
  type ReportEntToTabResultError,
  zReportEntToTabResultError
} from '#common/types/backend/function-errors/report-ent-to-tab-result-error';

export type GetReportCheckExistsAndAccessResultError =
  | BackendForbiddenReportError
  | BackendReportCreatorIdMismatchError
  | BackendReportNotFoundError
  | ReportEntToTabResultError;

export let zGetReportCheckExistsAndAccessResultError = z.union([
  zBackendForbiddenReportError,
  zBackendReportCreatorIdMismatchError,
  zBackendReportNotFoundError,
  zReportEntToTabResultError
]);

assertTypesEqual<
  GetReportCheckExistsAndAccessResultError,
  z.infer<typeof zGetReportCheckExistsAndAccessResultError>
>({ value: true });
