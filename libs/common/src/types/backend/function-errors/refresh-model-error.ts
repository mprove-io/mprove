import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetDiscoveredLlmModelPartError,
  zGetDiscoveredLlmModelPartError
} from '#common/types/backend/function-errors/get-discovered-llm-model-part-error';
import {
  type ReconcileDiscoveredModelVariantsError,
  zReconcileDiscoveredModelVariantsError
} from '#common/types/backend/function-errors/reconcile-discovered-model-variants-error';
import {
  type ValidateManualModelLimitsError,
  zValidateManualModelLimitsError
} from '#common/types/backend/function-errors/validate-manual-model-limits-error';
import {
  type ValidateModelVariantsError,
  zValidateModelVariantsError
} from '#common/types/backend/function-errors/validate-model-variants-error';

export type RefreshModelError =
  | GetDiscoveredLlmModelPartError
  | ValidateManualModelLimitsError
  | ValidateModelVariantsError
  | ReconcileDiscoveredModelVariantsError;

export const zRefreshModelError = z.union([
  zGetDiscoveredLlmModelPartError,
  zValidateManualModelLimitsError,
  zValidateModelVariantsError,
  zReconcileDiscoveredModelVariantsError
]);

assertTypesEqual<RefreshModelError, z.infer<typeof zRefreshModelError>>({
  value: true
});
