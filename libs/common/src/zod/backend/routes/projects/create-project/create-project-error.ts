import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendCreateProjectError = BackendError;

export let zToBackendCreateProjectError = zBackendError;

assertTypesEqual<
  ToBackendCreateProjectError,
  z.infer<typeof zToBackendCreateProjectError>
>({ value: true });
