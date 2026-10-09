import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendLlmModelVariantsInvalidError,
  zBackendLlmModelVariantsInvalidError
} from '#common/types/backend/errors/backend-llm-model-variants-invalid-error';

export type ReconcileDiscoveredModelVariantsResultError =
  BackendLlmModelVariantsInvalidError;

export const zReconcileDiscoveredModelVariantsResultError =
  zBackendLlmModelVariantsInvalidError;

assertTypesEqual<
  ReconcileDiscoveredModelVariantsResultError,
  z.infer<typeof zReconcileDiscoveredModelVariantsResultError>
>({ value: true });
