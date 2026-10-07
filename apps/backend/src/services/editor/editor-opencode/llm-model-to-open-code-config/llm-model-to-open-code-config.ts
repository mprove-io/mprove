import { LLM_MODEL_DEFAULT_VARIANT } from '#common/constants/llm-models';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { LlmModel } from '#common/types/backend/parts/llm-models/llm-model';
export function llmModelToOpenCodeConfig(item: {
  model: LlmModel;
}): Record<string, unknown> {
  let { model } = item;
  let modelConfig: Record<string, unknown> = { name: model.name };
  if (isDefined(model.contextLimit)) {
    modelConfig.limit = {
      context: model.contextLimit,
      input: model.inputLimit,
      output: model.outputLimit ?? 0
    };
  }
  let variantEntries: [string, Record<string, unknown>][] = model.variants
    .filter(
      variant =>
        variant.isBuilder && variant.variant !== LLM_MODEL_DEFAULT_VARIANT
    )
    .map(variant => [variant.variant, { reasoningEffort: variant.variant }]);
  if (variantEntries.length > 0) {
    modelConfig.variants = Object.fromEntries(variantEntries);
  }
  return modelConfig;
}
