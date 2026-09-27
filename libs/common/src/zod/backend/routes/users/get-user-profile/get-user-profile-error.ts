import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetUserProfileError = BackendError;

export let zToBackendGetUserProfileError = zBackendError;

assertTypesEqual<
  ToBackendGetUserProfileError,
  z.infer<typeof zToBackendGetUserProfileError>
>({ value: true });
