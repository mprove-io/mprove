import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ReportEntToTabError,
  zReportEntToTabError
} from '#common/types/backend/function-errors/report-ent-to-tab-error';

export type DbReportsFindFirstError = ReportEntToTabError;

export let zDbReportsFindFirstError = zReportEntToTabError;

assertTypesEqual<
  DbReportsFindFirstError,
  z.infer<typeof zDbReportsFindFirstError>
>({
  value: true
});
