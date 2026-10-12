import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type ReportEntToTabError = GetTabPropsError;

export let zReportEntToTabError = zGetTabPropsError;

assertTypesEqual<ReportEntToTabError, z.infer<typeof zReportEntToTabError>>({
  value: true
});
