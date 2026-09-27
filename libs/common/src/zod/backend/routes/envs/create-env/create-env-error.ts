import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendCreateEnvError = BackendError;

export let zToBackendCreateEnvError = zBackendError;

assertTypesEqual<
  ToBackendCreateEnvError,
  z.infer<typeof zToBackendCreateEnvError>
>({ value: true });
