import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendLlmModelAlreadyExistsError,
  zBackendLlmModelAlreadyExistsError
} from '#common/types/backend/errors/backend-llm-model-already-exists-error';

export type CheckLlmModelDoesNotExistResultError =
  BackendLlmModelAlreadyExistsError;

export const zCheckLlmModelDoesNotExistResultError =
  zBackendLlmModelAlreadyExistsError;

assertTypesEqual<
  CheckLlmModelDoesNotExistResultError,
  z.infer<typeof zCheckLlmModelDoesNotExistResultError>
>({ value: true });
