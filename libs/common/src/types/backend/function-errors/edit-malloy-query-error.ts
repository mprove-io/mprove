import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetApiEnvConnectionsWithFallbackError,
  zGetApiEnvConnectionsWithFallbackError
} from '#common/types/backend/function-errors/get-api-env-connections-with-fallback-error';
import {
  type GetSelectedGivensError,
  zGetSelectedGivensError
} from '#common/types/backend/function-errors/get-selected-givens-error';

export type EditMalloyQueryError =
  | GetApiEnvConnectionsWithFallbackError
  | GetSelectedGivensError;

export const zEditMalloyQueryError = z.union([
  zGetApiEnvConnectionsWithFallbackError,
  zGetSelectedGivensError
]);

assertTypesEqual<EditMalloyQueryError, z.infer<typeof zEditMalloyQueryError>>({
  value: true
});
