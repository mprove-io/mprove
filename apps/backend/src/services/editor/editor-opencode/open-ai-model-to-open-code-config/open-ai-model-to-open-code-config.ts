import type { Model } from '@opencode-ai/models';
import { getOpenAiVariantOptions } from '#backend/functions/llm-providers/openai/get-open-ai-variant-options/get-open-ai-variant-options';
import { LLM_MODEL_DEFAULT_VARIANT } from '#common/constants/llm-models';
import type { LlmModel } from '#common/types/backend/parts/llm-models/llm-model';
export function openAiModelToOpenCodeConfig(item: {
  model: LlmModel;
}): Record<string, unknown> {
  let { model } = item;
  let modelsDev: Model = model.providerModelInfo?.modelsDev as unknown as Model;
  let variantEntries: [string, Record<string, unknown>][] = model.variants
    .filter(
      variant =>
        variant.isBuilder && variant.variant !== LLM_MODEL_DEFAULT_VARIANT
    )
    .map(variant => [
      variant.variant,
      getOpenAiVariantOptions({ variant: variant.variant })
    ]);
  let modelConfig: Record<string, unknown> = {
    name: model.name ?? model.catalogName,
    release_date: modelsDev.release_date,
    status: modelsDev.status,
    reasoning: modelsDev.reasoning,
    attachment: modelsDev.attachment,
    tool_call: modelsDev.tool_call,
    limit: {
      context: modelsDev.limit.context,
      input: modelsDev.limit.input,
      output: modelsDev.limit.output
    },
    modalities: {
      input: modelsDev.modalities.input,
      output: modelsDev.modalities.output
    },
    variants: Object.fromEntries(variantEntries)
  };
  return modelConfig;
}
