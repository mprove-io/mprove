import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetDiscoveredLlmModelPartResultError,
  zGetDiscoveredLlmModelPartResultError
} from '#common/types/backend/function-errors/get-discovered-llm-model-part-result-error';
import {
  type ReconcileDiscoveredModelVariantsResultError,
  zReconcileDiscoveredModelVariantsResultError
} from '#common/types/backend/function-errors/reconcile-discovered-model-variants-result-error';
import {
  type ValidateManualModelLimitsResultError,
  zValidateManualModelLimitsResultError
} from '#common/types/backend/function-errors/validate-manual-model-limits-result-error';
import {
  type ValidateModelVariantsResultError,
  zValidateModelVariantsResultError
} from '#common/types/backend/function-errors/validate-model-variants-result-error';

export type RefreshModelResultError =
  | GetDiscoveredLlmModelPartResultError
  | ValidateManualModelLimitsResultError
  | ValidateModelVariantsResultError
  | ReconcileDiscoveredModelVariantsResultError;

export const zRefreshModelResultError = z.union([
  zGetDiscoveredLlmModelPartResultError,
  zValidateManualModelLimitsResultError,
  zValidateModelVariantsResultError,
  zReconcileDiscoveredModelVariantsResultError
]);

assertTypesEqual<
  RefreshModelResultError,
  z.infer<typeof zRefreshModelResultError>
>({ value: true });
