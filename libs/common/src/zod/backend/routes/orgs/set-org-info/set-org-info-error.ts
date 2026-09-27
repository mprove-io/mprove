import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendSetOrgInfoError = BackendError;

export let zToBackendSetOrgInfoError = zBackendError;

assertTypesEqual<
  ToBackendSetOrgInfoError,
  z.infer<typeof zToBackendSetOrgInfoError>
>({ value: true });
