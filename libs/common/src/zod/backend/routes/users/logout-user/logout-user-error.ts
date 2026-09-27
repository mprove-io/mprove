import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendLogoutUserError = BackendError;

export let zToBackendLogoutUserError = zBackendError;

assertTypesEqual<
  ToBackendLogoutUserError,
  z.infer<typeof zToBackendLogoutUserError>
>({ value: true });
