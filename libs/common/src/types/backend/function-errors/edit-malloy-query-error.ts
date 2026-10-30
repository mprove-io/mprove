import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetApiEnvConnectionsWithFallbackError,
  zGetApiEnvConnectionsWithFallbackError
} from '#common/types/backend/function-errors/get-api-env-connections-with-fallback-error';
import {
  type GetUserSelectedGivensError,
  zGetUserSelectedGivensError
} from '#common/types/backend/function-errors/get-user-selected-givens-error';
import {
  type MakeMalloyQueryError,
  zMakeMalloyQueryError
} from '#common/types/node-common/function-errors/make-malloy-query-error';

export type EditMalloyQueryError =
  | GetApiEnvConnectionsWithFallbackError
  | GetUserSelectedGivensError
  | MakeMalloyQueryError;

export const zEditMalloyQueryError = z.union([
  zGetApiEnvConnectionsWithFallbackError,
  zGetUserSelectedGivensError,
  zMakeMalloyQueryError
]);

assertTypesEqual<EditMalloyQueryError, z.infer<typeof zEditMalloyQueryError>>({
  value: true
});
