import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendLlmModelDoesNotExistError,
  zBackendLlmModelDoesNotExistError
} from '#common/types/backend/errors/backend-llm-model-does-not-exist-error';

export type GetLlmModelCheckExistsError = BackendLlmModelDoesNotExistError;

export const zGetLlmModelCheckExistsError = zBackendLlmModelDoesNotExistError;

assertTypesEqual<
  GetLlmModelCheckExistsError,
  z.infer<typeof zGetLlmModelCheckExistsError>
>({ value: true });
