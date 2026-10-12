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
  type ReportEntToTabError,
  zReportEntToTabError
} from '#common/types/backend/function-errors/report-ent-to-tab-error';

export type GetReportCheckExistsAndAccessError =
  | BackendForbiddenReportError
  | BackendReportCreatorIdMismatchError
  | BackendReportNotFoundError
  | ReportEntToTabError;

export let zGetReportCheckExistsAndAccessError = z.union([
  zBackendForbiddenReportError,
  zBackendReportCreatorIdMismatchError,
  zBackendReportNotFoundError,
  zReportEntToTabError
]);

assertTypesEqual<
  GetReportCheckExistsAndAccessError,
  z.infer<typeof zGetReportCheckExistsAndAccessError>
>({ value: true });
