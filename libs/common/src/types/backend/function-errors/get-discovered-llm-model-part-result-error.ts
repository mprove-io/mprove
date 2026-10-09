import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendLlmModelNotDiscoveredError,
  zBackendLlmModelNotDiscoveredError
} from '#common/types/backend/errors/backend-llm-model-not-discovered-error';
import {
  type GetModelPartsResultError,
  zGetModelPartsResultError
} from '#common/types/backend/function-errors/get-model-parts-result-error';

export type GetDiscoveredLlmModelPartResultError =
  | GetModelPartsResultError
  | BackendLlmModelNotDiscoveredError;

export const zGetDiscoveredLlmModelPartResultError = z.union([
  zGetModelPartsResultError,
  zBackendLlmModelNotDiscoveredError
]);

assertTypesEqual<
  GetDiscoveredLlmModelPartResultError,
  z.infer<typeof zGetDiscoveredLlmModelPartResultError>
>({ value: true });
