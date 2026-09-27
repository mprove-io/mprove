import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetRolesError = BackendError;

export let zToBackendGetRolesError = zBackendError;

assertTypesEqual<
  ToBackendGetRolesError,
  z.infer<typeof zToBackendGetRolesError>
>({ value: true });
