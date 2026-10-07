import type Anthropic from '@anthropic-ai/sdk';
import { getAnthropicModelVariants } from '#backend/functions/llm-providers/anthropic/get-anthropic-model-variants/get-anthropic-model-variants';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { LlmModelPart } from '#common/types/backend/parts/llm-models/llm-model-part';
export function anthropicModelToLlmModelPart(item: {
  anthropicModel: Anthropic.Models.ModelInfo;
}): LlmModelPart {
  let { anthropicModel } = item;
  let variants: string[] = getAnthropicModelVariants({
    anthropicModel: anthropicModel
  });
  let modelPart: LlmModelPart = {
    modelId: anthropicModel.id,
    catalogName: anthropicModel.display_name,
    providerModelInfo: { ...anthropicModel },
    contextLimit: undefined,
    inputLimit:
      isDefined(anthropicModel.max_input_tokens) &&
      anthropicModel.max_input_tokens > 0
        ? anthropicModel.max_input_tokens
        : undefined,
    outputLimit:
      isDefined(anthropicModel.max_tokens) && anthropicModel.max_tokens > 0
        ? anthropicModel.max_tokens
        : undefined,
    variants: variants.length > 0 ? variants : undefined,
    isOpencodeSupported: true
  };
  return modelPart;
}
