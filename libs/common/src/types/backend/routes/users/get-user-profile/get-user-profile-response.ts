import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetUserProfileOutput,
  zToBackendGetUserProfileOutput
} from '#common/types/backend/routes/users/get-user-profile/get-user-profile-output';
import {
  type ToBackendGetUserProfileError,
  zToBackendGetUserProfileError
} from './get-user-profile-error';

export type ToBackendGetUserProfileResponse = ToBackendResponseBase<
  'getUserProfile',
  ToBackendGetUserProfileOutput,
  ToBackendGetUserProfileError
>;

export let zToBackendGetUserProfileResponse = makeToBackendResponseSchema({
  operation: 'getUserProfile',
  output: zToBackendGetUserProfileOutput,
  error: zToBackendGetUserProfileError
}).meta({ id: 'ToBackendGetUserProfileResponse' });

assertTypesEqual<
  ToBackendGetUserProfileResponse,
  z.infer<typeof zToBackendGetUserProfileResponse>
>({ value: true });
