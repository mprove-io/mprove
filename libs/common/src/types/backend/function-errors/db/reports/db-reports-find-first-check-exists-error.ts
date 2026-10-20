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

export type DbReportsFindFirstCheckExistsError =
  | ReportEntToTabError
  | BackendReportNotFoundError;

export let zDbReportsFindFirstCheckExistsError = z.union([
  zReportEntToTabError,
  zBackendReportNotFoundError
]);

assertTypesEqual<
  DbReportsFindFirstCheckExistsError,
  z.infer<typeof zDbReportsFindFirstCheckExistsError>
>({
  value: true
});
