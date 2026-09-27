import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendCreateOrgError = BackendError;

export let zToBackendCreateOrgError = zBackendError;

assertTypesEqual<
  ToBackendCreateOrgError,
  z.infer<typeof zToBackendCreateOrgError>
>({ value: true });
