import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendLlmModelAlreadyExistsError,
  zBackendLlmModelAlreadyExistsError
} from '#common/types/backend/errors/backend-llm-model-already-exists-error';

export type CheckLlmModelDoesNotExistError = BackendLlmModelAlreadyExistsError;

export const zCheckLlmModelDoesNotExistError =
  zBackendLlmModelAlreadyExistsError;

assertTypesEqual<
  CheckLlmModelDoesNotExistError,
  z.infer<typeof zCheckLlmModelDoesNotExistError>
>({ value: true });
