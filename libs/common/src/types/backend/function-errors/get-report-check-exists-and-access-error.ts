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
  type DbReportsFindFirstCheckExistsError,
  zDbReportsFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/reports/db-reports-find-first-check-exists-error';

export type GetReportCheckExistsAndAccessError =
  | BackendForbiddenReportError
  | BackendReportCreatorIdMismatchError
  | DbReportsFindFirstCheckExistsError;

export let zGetReportCheckExistsAndAccessError = z.union([
  zBackendForbiddenReportError,
  zBackendReportCreatorIdMismatchError,
  zDbReportsFindFirstCheckExistsError
]);

assertTypesEqual<
  GetReportCheckExistsAndAccessError,
  z.infer<typeof zGetReportCheckExistsAndAccessError>
>({ value: true });
