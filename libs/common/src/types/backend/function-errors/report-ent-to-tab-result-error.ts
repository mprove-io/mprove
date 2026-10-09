import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsResultError,
  zGetTabPropsResultError
} from '#common/types/backend/function-errors/get-tab-props-result-error';

export type ReportEntToTabResultError = GetTabPropsResultError;

export let zReportEntToTabResultError = zGetTabPropsResultError;

assertTypesEqual<
  ReportEntToTabResultError,
  z.infer<typeof zReportEntToTabResultError>
>({ value: true });
