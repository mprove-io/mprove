import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendSetFavoriteError,
  zToBackendSetFavoriteError
} from './set-favorite-error';

export type ToBackendSetFavoriteOutput = Record<string, never>;

export type ToBackendSetFavoriteResponse = ToBackendResponse<
  ToBackendSetFavoriteOutput,
  ToBackendSetFavoriteError
>;

export let zToBackendSetFavoriteOutput = z
  .object({})
  .meta({ id: 'ToBackendSetFavoriteOutput' });

export let zToBackendSetFavoriteResponse = makeToBackendResponseSchema({
  success: zToBackendSetFavoriteOutput,
  error: zToBackendSetFavoriteError
}).meta({ id: 'ToBackendSetFavoriteResponse' });

assertTypesEqual<
  ToBackendSetFavoriteOutput,
  z.infer<typeof zToBackendSetFavoriteOutput>
>({ value: true });

assertTypesEqual<
  ToBackendSetFavoriteResponse,
  z.infer<typeof zToBackendSetFavoriteResponse>
>({ value: true });
