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
import {
  type MakeMalloyQueryError,
  zMakeMalloyQueryError
} from '#common/types/node-common/function-errors/make-malloy-query-error';

export type EditMalloyQueryError =
  | GetApiEnvConnectionsWithFallbackError
  | GetSelectedGivensError
  | MakeMalloyQueryError;

export const zEditMalloyQueryError = z.union([
  zGetApiEnvConnectionsWithFallbackError,
  zGetSelectedGivensError,
  zMakeMalloyQueryError
]);

assertTypesEqual<EditMalloyQueryError, z.infer<typeof zEditMalloyQueryError>>({
  value: true
});
