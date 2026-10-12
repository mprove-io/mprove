import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type ChartEntToTabError = GetTabPropsError;

export let zChartEntToTabError = zGetTabPropsError;

assertTypesEqual<ChartEntToTabError, z.infer<typeof zChartEntToTabError>>({
  value: true
});
