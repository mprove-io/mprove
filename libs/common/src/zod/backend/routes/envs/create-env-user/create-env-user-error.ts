import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendCreateEnvUserError = BackendError;

export let zToBackendCreateEnvUserError = zBackendError;

assertTypesEqual<
  ToBackendCreateEnvUserError,
  z.infer<typeof zToBackendCreateEnvUserError>
>({ value: true });
