import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type User, zUser } from '#common/zod/backend/user';
import {
  type ToBackendGetUserProfileError,
  zToBackendGetUserProfileError
} from './get-user-profile-error';

export type ToBackendGetUserProfileOutput = {
  user: User;
};

export type ToBackendGetUserProfileResponse = ToBackendResponse<
  ToBackendGetUserProfileOutput,
  ToBackendGetUserProfileError
>;

export let zToBackendGetUserProfileOutput = z
  .object({
    user: zUser
  })
  .meta({ id: 'ToBackendGetUserProfileOutput' });

export let zToBackendGetUserProfileResponse = makeToBackendResponseSchema({
  success: zToBackendGetUserProfileOutput,
  error: zToBackendGetUserProfileError
}).meta({ id: 'ToBackendGetUserProfileResponse' });

assertTypesEqual<
  ToBackendGetUserProfileOutput,
  z.infer<typeof zToBackendGetUserProfileOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetUserProfileResponse,
  z.infer<typeof zToBackendGetUserProfileResponse>
>({ value: true });
