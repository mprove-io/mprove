import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendLlmModelDoesNotExistError,
  zBackendLlmModelDoesNotExistError
} from '#common/types/backend/errors/backend-llm-model-does-not-exist-error';

export type GetLlmModelCheckExistsResultError =
  BackendLlmModelDoesNotExistError;

export const zGetLlmModelCheckExistsResultError =
  zBackendLlmModelDoesNotExistError;

assertTypesEqual<
  GetLlmModelCheckExistsResultError,
  z.infer<typeof zGetLlmModelCheckExistsResultError>
>({ value: true });
