import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendGivenAlreadyExistsError,
  zBackendGivenAlreadyExistsError
} from '#common/types/backend/errors/backend-given-already-exists-error';

export type CheckGivenDoesNotExistResultError = BackendGivenAlreadyExistsError;

export let zCheckGivenDoesNotExistResultError = zBackendGivenAlreadyExistsError;

assertTypesEqual<
  CheckGivenDoesNotExistResultError,
  z.infer<typeof zCheckGivenDoesNotExistResultError>
>({ value: true });
