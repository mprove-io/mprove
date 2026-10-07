import type Anthropic from '@anthropic-ai/sdk';
import {
  type AnthropicVariantOptions,
  getAnthropicVariantOptions
} from '#backend/functions/llm-providers/anthropic/get-anthropic-variant-options/get-anthropic-variant-options';
import { LLM_MODEL_DEFAULT_VARIANT } from '#common/constants/llm-models';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { LlmModel } from '#common/types/backend/parts/llm-models/llm-model';
export function anthropicModelToOpenCodeConfig(item: {
  model: LlmModel;
}): Record<string, unknown> {
  let { model } = item;
  let anthropicModel: Anthropic.Models.ModelInfo =
    model.providerModelInfo as unknown as Anthropic.Models.ModelInfo;
  let variantEntries: [string, AnthropicVariantOptions][] = model.variants
    .filter(
      variant =>
        variant.isBuilder && variant.variant !== LLM_MODEL_DEFAULT_VARIANT
    )
    .flatMap(variant => {
      let options: ReturnType<typeof getAnthropicVariantOptions> =
        getAnthropicVariantOptions({
          anthropicModel: anthropicModel,
          variant: variant.variant
        });
      return isDefined(options) ? [[variant.variant, options]] : [];
    });
  let inputModalities: string[] = ['text'];
  let isImageInputSupported: boolean =
    anthropicModel.capabilities?.image_input?.supported === true;
  if (isImageInputSupported) {
    inputModalities.push('image');
  }
  let isPdfInputSupported: boolean =
    anthropicModel.capabilities?.pdf_input?.supported === true;
  if (isPdfInputSupported) {
    inputModalities.push('pdf');
  }
  let modelConfig: Record<string, unknown> = {
    name: model.name ?? model.catalogName,
    release_date: anthropicModel.created_at.slice(0, 10),
    reasoning: anthropicModel.capabilities?.thinking?.supported === true,
    attachment: inputModalities.length > 1,
    tool_call: true,
    limit: {
      context: anthropicModel.max_input_tokens ?? 0,
      input: anthropicModel.max_input_tokens,
      output: anthropicModel.max_tokens ?? 0
    },
    modalities: {
      input: inputModalities,
      output: ['text']
    },
    variants: Object.fromEntries(variantEntries)
  };
  return modelConfig;
}
