import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendEnvAlreadyExistsError,
  zBackendEnvAlreadyExistsError
} from '#common/types/backend/errors/backend-env-already-exists-error';

export type CheckEnvDoesNotExistResultError = BackendEnvAlreadyExistsError;

export let zCheckEnvDoesNotExistResultError = zBackendEnvAlreadyExistsError;

assertTypesEqual<
  CheckEnvDoesNotExistResultError,
  z.infer<typeof zCheckEnvDoesNotExistResultError>
>({ value: true });
