import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendSetFavoriteOutput,
  zToBackendSetFavoriteOutput
} from '#common/types/backend/routes/favorites/set-favorite/set-favorite-output';
import {
  type ToBackendSetFavoriteError,
  zToBackendSetFavoriteError
} from './set-favorite-error';

export type ToBackendSetFavoriteResponse = ToBackendResponseBase<
  'setFavorite',
  ToBackendSetFavoriteOutput,
  ToBackendSetFavoriteError
>;

export let zToBackendSetFavoriteResponse = makeToBackendResponseSchema({
  operation: 'setFavorite',
  output: zToBackendSetFavoriteOutput,
  error: zToBackendSetFavoriteError
}).meta({ id: 'ToBackendSetFavoriteResponse' });

assertTypesEqual<
  ToBackendSetFavoriteResponse,
  z.infer<typeof zToBackendSetFavoriteResponse>
>({ value: true });
