import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendSetAvatarOutput,
  zToBackendSetAvatarOutput
} from '#common/zod/backend/routes/avatars/set-avatar/set-avatar-output';
import {
  type ToBackendSetAvatarError,
  zToBackendSetAvatarError
} from './set-avatar-error';

export type ToBackendSetAvatarResponse = ToBackendResponseBase<
  'setAvatar',
  ToBackendSetAvatarOutput,
  ToBackendSetAvatarError
>;

export let zToBackendSetAvatarResponse = makeToBackendResponseSchema({
  operation: 'setAvatar',
  output: zToBackendSetAvatarOutput,
  error: zToBackendSetAvatarError
}).meta({ id: 'ToBackendSetAvatarResponse' });

assertTypesEqual<
  ToBackendSetAvatarResponse,
  z.infer<typeof zToBackendSetAvatarResponse>
>({ value: true });
