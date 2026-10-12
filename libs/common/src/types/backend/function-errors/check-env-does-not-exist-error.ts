import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendEnvAlreadyExistsError,
  zBackendEnvAlreadyExistsError
} from '#common/types/backend/errors/backend-env-already-exists-error';

export type CheckEnvDoesNotExistError = BackendEnvAlreadyExistsError;

export let zCheckEnvDoesNotExistError = zBackendEnvAlreadyExistsError;

assertTypesEqual<
  CheckEnvDoesNotExistError,
  z.infer<typeof zCheckEnvDoesNotExistError>
>({ value: true });
