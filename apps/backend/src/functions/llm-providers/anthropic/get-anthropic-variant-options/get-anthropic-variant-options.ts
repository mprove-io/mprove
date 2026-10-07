import type Anthropic from '@anthropic-ai/sdk';
import { getAnthropicModelVariants } from '#backend/functions/llm-providers/anthropic/get-anthropic-model-variants/get-anthropic-model-variants';
import { anthropicUsesSummarizedThinking } from '#backend/functions/llm-providers/anthropic/get-anthropic-variant-options/anthropic-uses-summarized-thinking/anthropic-uses-summarized-thinking';
import type { AnthropicModelVariant } from '#backend/types/anthropic-model-variant';
export type AnthropicVariantOptions =
  | {
      thinking: {
        type: 'adaptive';
        display?: 'summarized';
      };
      effort: AnthropicModelVariant;
    }
  | {
      thinking: {
        type: 'enabled';
        budgetTokens: number;
      };
    };
export function getAnthropicVariantOptions(item: {
  anthropicModel: Anthropic.Models.ModelInfo;
  variant: string;
}): AnthropicVariantOptions | undefined {
  let { anthropicModel, variant } = item;
  let variants: AnthropicModelVariant[] = getAnthropicModelVariants({
    anthropicModel: anthropicModel
  });
  let isVariantSupported: boolean = variants.includes(
    variant as AnthropicModelVariant
  );
  if (isVariantSupported === false) {
    return undefined;
  }
  let isAdaptiveSupported: boolean =
    anthropicModel.capabilities?.thinking?.types?.adaptive?.supported === true;
  if (isAdaptiveSupported) {
    let usesSummarizedThinking: boolean = anthropicUsesSummarizedThinking({
      modelId: anthropicModel.id
    });
    return {
      thinking: {
        type: 'adaptive',
        ...(usesSummarizedThinking ? { display: 'summarized' as const } : {})
      },
      effort: variant as AnthropicModelVariant
    };
  }
  let maxTokens: number = anthropicModel.max_tokens ?? 32000;
  let budgetTokens: number =
    variant === 'max'
      ? Math.min(31999, maxTokens - 1)
      : Math.min(16000, Math.floor(maxTokens / 2 - 1));
  if (budgetTokens < 1024) {
    return undefined;
  }
  return {
    thinking: {
      type: 'enabled',
      budgetTokens: budgetTokens
    }
  };
}
