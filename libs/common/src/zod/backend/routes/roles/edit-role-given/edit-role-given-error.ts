import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendEditRoleGivenError = BackendError;

export let zToBackendEditRoleGivenError = zBackendError;

assertTypesEqual<
  ToBackendEditRoleGivenError,
  z.infer<typeof zToBackendEditRoleGivenError>
>({ value: true });
