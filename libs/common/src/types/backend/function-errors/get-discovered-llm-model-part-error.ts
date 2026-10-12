import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendLlmModelNotDiscoveredError,
  zBackendLlmModelNotDiscoveredError
} from '#common/types/backend/errors/backend-llm-model-not-discovered-error';
import {
  type GetModelPartsError,
  zGetModelPartsError
} from '#common/types/backend/function-errors/get-model-parts-error';

export type GetDiscoveredLlmModelPartError =
  | GetModelPartsError
  | BackendLlmModelNotDiscoveredError;

export const zGetDiscoveredLlmModelPartError = z.union([
  zGetModelPartsError,
  zBackendLlmModelNotDiscoveredError
]);

assertTypesEqual<
  GetDiscoveredLlmModelPartError,
  z.infer<typeof zGetDiscoveredLlmModelPartError>
>({ value: true });
