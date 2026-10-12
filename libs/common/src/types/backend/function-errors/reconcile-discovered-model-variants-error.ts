import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendLlmModelVariantsInvalidError,
  zBackendLlmModelVariantsInvalidError
} from '#common/types/backend/errors/backend-llm-model-variants-invalid-error';

export type ReconcileDiscoveredModelVariantsError =
  BackendLlmModelVariantsInvalidError;

export const zReconcileDiscoveredModelVariantsError =
  zBackendLlmModelVariantsInvalidError;

assertTypesEqual<
  ReconcileDiscoveredModelVariantsError,
  z.infer<typeof zReconcileDiscoveredModelVariantsError>
>({ value: true });
