import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsResultError,
  zGetTabPropsResultError
} from '#common/types/backend/function-errors/get-tab-props-result-error';

export type ChartEntToTabResultError = GetTabPropsResultError;

export let zChartEntToTabResultError = zGetTabPropsResultError;

assertTypesEqual<
  ChartEntToTabResultError,
  z.infer<typeof zChartEntToTabResultError>
>({ value: true });
