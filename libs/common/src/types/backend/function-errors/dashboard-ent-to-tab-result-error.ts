import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsResultError,
  zGetTabPropsResultError
} from '#common/types/backend/function-errors/get-tab-props-result-error';

export type DashboardEntToTabResultError = GetTabPropsResultError;

export let zDashboardEntToTabResultError = zGetTabPropsResultError;

assertTypesEqual<
  DashboardEntToTabResultError,
  z.infer<typeof zDashboardEntToTabResultError>
>({ value: true });
