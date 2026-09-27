import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendDeleteRoleError = BackendError;

export let zToBackendDeleteRoleError = zBackendError;

assertTypesEqual<
  ToBackendDeleteRoleError,
  z.infer<typeof zToBackendDeleteRoleError>
>({ value: true });
