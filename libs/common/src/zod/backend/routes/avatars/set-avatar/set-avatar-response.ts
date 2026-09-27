import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendSetAvatarError,
  zToBackendSetAvatarError
} from './set-avatar-error';

export type ToBackendSetAvatarOutput = {
  avatarSmall: string;
  avatarBig: string;
};

export type ToBackendSetAvatarResponse = ToBackendResponse<
  ToBackendSetAvatarOutput,
  ToBackendSetAvatarError
>;

export let zToBackendSetAvatarOutput = z
  .object({
    avatarSmall: z.string(),
    avatarBig: z.string()
  })
  .meta({ id: 'ToBackendSetAvatarOutput' });

export let zToBackendSetAvatarResponse = makeToBackendResponseSchema({
  success: zToBackendSetAvatarOutput,
  error: zToBackendSetAvatarError
}).meta({ id: 'ToBackendSetAvatarResponse' });

assertTypesEqual<
  ToBackendSetAvatarOutput,
  z.infer<typeof zToBackendSetAvatarOutput>
>({ value: true });

assertTypesEqual<
  ToBackendSetAvatarResponse,
  z.infer<typeof zToBackendSetAvatarResponse>
>({ value: true });
