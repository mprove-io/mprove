import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendLlmModelAlreadyExistsError,
  zBackendLlmModelAlreadyExistsError
} from '#common/types/backend/errors/backend-llm-model-already-exists-error';

export type CheckProviderModelDoesNotExistError =
  BackendLlmModelAlreadyExistsError;

export const zCheckProviderModelDoesNotExistError =
  zBackendLlmModelAlreadyExistsError;

assertTypesEqual<
  CheckProviderModelDoesNotExistError,
  z.infer<typeof zCheckProviderModelDoesNotExistError>
>({ value: true });
