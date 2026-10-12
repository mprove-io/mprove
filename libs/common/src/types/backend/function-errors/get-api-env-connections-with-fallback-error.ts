import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionEntToTabError,
  zConnectionEntToTabError
} from '#common/types/backend/function-errors/connection-ent-to-tab-error';
import {
  type GetApiEnvsError,
  zGetApiEnvsError
} from '#common/types/backend/function-errors/get-api-envs-error';

export type GetApiEnvConnectionsWithFallbackError =
  | GetApiEnvsError
  | ConnectionEntToTabError;

export const zGetApiEnvConnectionsWithFallbackError = z.union([
  zGetApiEnvsError,
  zConnectionEntToTabError
]);

assertTypesEqual<
  GetApiEnvConnectionsWithFallbackError,
  z.infer<typeof zGetApiEnvConnectionsWithFallbackError>
>({ value: true });
