import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendDeleteOrgError = BackendError;

export let zToBackendDeleteOrgError = zBackendError;

assertTypesEqual<
  ToBackendDeleteOrgError,
  z.infer<typeof zToBackendDeleteOrgError>
>({ value: true });
