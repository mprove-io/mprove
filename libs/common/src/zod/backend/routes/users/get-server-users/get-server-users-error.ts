import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetServerUsersError = BackendError;

export let zToBackendGetServerUsersError = zBackendError;

assertTypesEqual<
  ToBackendGetServerUsersError,
  z.infer<typeof zToBackendGetServerUsersError>
>({ value: true });
