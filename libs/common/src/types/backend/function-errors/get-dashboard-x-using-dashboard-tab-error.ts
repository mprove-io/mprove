import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MconfigEntToTabError,
  zMconfigEntToTabError
} from '#common/types/backend/function-errors/mconfig-ent-to-tab-error';
import {
  type ModelEntToTabError,
  zModelEntToTabError
} from '#common/types/backend/function-errors/model-ent-to-tab-error';
import {
  type QueryEntToTabError,
  zQueryEntToTabError
} from '#common/types/backend/function-errors/query-ent-to-tab-error';

export type GetDashboardXUsingDashboardTabError =
  | MconfigEntToTabError
  | QueryEntToTabError
  | ModelEntToTabError;

export const zGetDashboardXUsingDashboardTabError = z.union([
  zMconfigEntToTabError,
  zQueryEntToTabError,
  zModelEntToTabError
]);

assertTypesEqual<
  GetDashboardXUsingDashboardTabError,
  z.infer<typeof zGetDashboardXUsingDashboardTabError>
>({ value: true });
