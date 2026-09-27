import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendDeleteRoleGivenError = BackendError;

export let zToBackendDeleteRoleGivenError = zBackendError;

assertTypesEqual<
  ToBackendDeleteRoleGivenError,
  z.infer<typeof zToBackendDeleteRoleGivenError>
>({ value: true });
