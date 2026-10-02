import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetAvatarBigOutput,
  zToBackendGetAvatarBigOutput
} from '#common/types/backend/routes/avatars/get-avatar-big/get-avatar-big-output';
import {
  type ToBackendGetAvatarBigError,
  zToBackendGetAvatarBigError
} from './get-avatar-big-error';

export type ToBackendGetAvatarBigResponse = ToBackendResponseBase<
  'getAvatarBig',
  ToBackendGetAvatarBigOutput,
  ToBackendGetAvatarBigError
>;

export let zToBackendGetAvatarBigResponse = makeToBackendResponseSchema({
  operation: 'getAvatarBig',
  output: zToBackendGetAvatarBigOutput,
  error: zToBackendGetAvatarBigError
}).meta({ id: 'ToBackendGetAvatarBigResponse' });

assertTypesEqual<
  ToBackendGetAvatarBigResponse,
  z.infer<typeof zToBackendGetAvatarBigResponse>
>({ value: true });
