import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetAvatarBigError = BackendError;

export let zToBackendGetAvatarBigError = zBackendError;

assertTypesEqual<
  ToBackendGetAvatarBigError,
  z.infer<typeof zToBackendGetAvatarBigError>
>({ value: true });
