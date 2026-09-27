import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetOrgError = BackendError;

export let zToBackendGetOrgError = zBackendError;

assertTypesEqual<ToBackendGetOrgError, z.infer<typeof zToBackendGetOrgError>>({
  value: true
});
