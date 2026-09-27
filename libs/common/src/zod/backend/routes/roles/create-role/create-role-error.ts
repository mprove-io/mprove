import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendCreateRoleError = BackendError;

export let zToBackendCreateRoleError = zBackendError;

assertTypesEqual<
  ToBackendCreateRoleError,
  z.infer<typeof zToBackendCreateRoleError>
>({ value: true });
