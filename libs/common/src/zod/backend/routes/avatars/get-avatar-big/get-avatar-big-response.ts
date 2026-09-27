import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendGetAvatarBigError,
  zToBackendGetAvatarBigError
} from './get-avatar-big-error';

export type ToBackendGetAvatarBigOutput = {
  avatarSmall: string;
  avatarBig: string;
};

export type ToBackendGetAvatarBigResponse = ToBackendResponse<
  ToBackendGetAvatarBigOutput,
  ToBackendGetAvatarBigError
>;

export let zToBackendGetAvatarBigOutput = z
  .object({
    avatarSmall: z.string(),
    avatarBig: z.string()
  })
  .meta({ id: 'ToBackendGetAvatarBigOutput' });

export let zToBackendGetAvatarBigResponse = makeToBackendResponseSchema({
  success: zToBackendGetAvatarBigOutput,
  error: zToBackendGetAvatarBigError
}).meta({ id: 'ToBackendGetAvatarBigResponse' });

assertTypesEqual<
  ToBackendGetAvatarBigOutput,
  z.infer<typeof zToBackendGetAvatarBigOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetAvatarBigResponse,
  z.infer<typeof zToBackendGetAvatarBigResponse>
>({ value: true });
