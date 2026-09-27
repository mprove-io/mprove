import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendSetOrgOwnerError = BackendError;

export let zToBackendSetOrgOwnerError = zBackendError;

assertTypesEqual<
  ToBackendSetOrgOwnerError,
  z.infer<typeof zToBackendSetOrgOwnerError>
>({ value: true });
