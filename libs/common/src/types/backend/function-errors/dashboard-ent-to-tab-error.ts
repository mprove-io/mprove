import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type DashboardEntToTabError = GetTabPropsError;

export let zDashboardEntToTabError = zGetTabPropsError;

assertTypesEqual<
  DashboardEntToTabError,
  z.infer<typeof zDashboardEntToTabError>
>({ value: true });
