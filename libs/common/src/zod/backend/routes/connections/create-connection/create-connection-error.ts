import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendCreateConnectionError = BackendError;

export let zToBackendCreateConnectionError = zBackendError;

assertTypesEqual<
  ToBackendCreateConnectionError,
  z.infer<typeof zToBackendCreateConnectionError>
>({ value: true });
