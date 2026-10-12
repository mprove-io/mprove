import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendGivenAlreadyExistsError,
  zBackendGivenAlreadyExistsError
} from '#common/types/backend/errors/backend-given-already-exists-error';

export type CheckGivenDoesNotExistError = BackendGivenAlreadyExistsError;

export let zCheckGivenDoesNotExistError = zBackendGivenAlreadyExistsError;

assertTypesEqual<
  CheckGivenDoesNotExistError,
  z.infer<typeof zCheckGivenDoesNotExistError>
>({ value: true });
