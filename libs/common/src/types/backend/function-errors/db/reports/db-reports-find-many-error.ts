import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ReportEntToTabError,
  zReportEntToTabError
} from '#common/types/backend/function-errors/report-ent-to-tab-error';

export type DbReportsFindManyError = ReportEntToTabError;

export let zDbReportsFindManyError = zReportEntToTabError;

assertTypesEqual<
  DbReportsFindManyError,
  z.infer<typeof zDbReportsFindManyError>
>({
  value: true
});
