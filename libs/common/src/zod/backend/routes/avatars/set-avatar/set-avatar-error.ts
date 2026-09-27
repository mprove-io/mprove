import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendSetAvatarError = BackendError;

export let zToBackendSetAvatarError = zBackendError;

assertTypesEqual<
  ToBackendSetAvatarError,
  z.infer<typeof zToBackendSetAvatarError>
>({ value: true });
