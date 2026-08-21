import type { AnthropicModel } from '#common/zod/backend/anthropic-model';

export type AnthropicModelVariant = 'low' | 'medium' | 'high' | 'max';

export type AnthropicVariantOptions =
  | {
      thinking: { type: 'adaptive' };
      effort: AnthropicModelVariant;
    }
  | {
      thinking: {
        type: 'enabled';
        budgetTokens: number;
      };
    };

export function getAnthropicModelVariants(item: {
  anthropicModel: AnthropicModel;
}): AnthropicModelVariant[] {
  let { anthropicModel } = item;

  let isThinkingSupported: boolean =
    anthropicModel.capabilities?.thinking?.supported === true;

  if (isThinkingSupported === false) {
    return [];
  }

  let isAdaptiveSupported: boolean =
    anthropicModel.capabilities?.thinking?.types?.adaptive?.supported === true;

  if (isAdaptiveSupported === false) {
    return ['high', 'max'];
  }

  let efforts: AnthropicModelVariant[] = ['low', 'medium', 'high', 'max'];

  let variants: AnthropicModelVariant[] = efforts.filter(
    effort =>
      anthropicModel.capabilities?.effort?.supported === true &&
      anthropicModel.capabilities.effort[effort]?.supported === true
  );

  return variants;
}

export function getAnthropicVariantOptions(item: {
  anthropicModel: AnthropicModel;
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
    return {
      thinking: { type: 'adaptive' },
      effort: variant as AnthropicModelVariant
    };
  }

  let maxTokens: number = anthropicModel.max_tokens ?? 32_000;

  let budgetTokens: number =
    variant === 'max'
      ? Math.min(31_999, maxTokens - 1)
      : Math.min(16_000, Math.floor(maxTokens / 2 - 1));

  if (budgetTokens < 1_024) {
    return undefined;
  }

  return {
    thinking: {
      type: 'enabled',
      budgetTokens: budgetTokens
    }
  };
}
