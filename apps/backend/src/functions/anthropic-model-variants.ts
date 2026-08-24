import type Anthropic from '@anthropic-ai/sdk';

export type AnthropicModelVariant = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

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

export function getAnthropicModelVariants(item: {
  anthropicModel: Anthropic.Models.ModelInfo;
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
    let isEnabledSupported: boolean =
      anthropicModel.capabilities?.thinking?.types?.enabled?.supported === true;

    if (isEnabledSupported === false) {
      return [];
    }

    return ['high', 'max'];
  }

  let efforts: AnthropicModelVariant[] = [
    'low',
    'medium',
    'high',
    'xhigh',
    'max'
  ];

  let variants: AnthropicModelVariant[] = efforts.filter(effort => {
    let effortCapabilities = anthropicModel.capabilities?.effort;

    if (effortCapabilities?.supported !== true) {
      return false;
    }

    let capability = effortCapabilities[effort];

    return capability?.supported === true;
  });

  return variants;
}

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

function anthropicUsesSummarizedThinking(item: { modelId: string }): boolean {
  let { modelId } = item;

  let normalizedId: string = modelId.toLowerCase();

  if (!normalizedId.includes('claude-')) {
    return false;
  }

  let version: RegExpExecArray | null =
    /claude-(?:[a-z]+-)?(\d+)(?:[.-](\d{1,2}))?(?:[.@-]|$)/i.exec(normalizedId);

  if (!version) {
    return true;
  }

  let major: number = Number(version[1]);

  let minor: number = Number(version[2] ?? 0);

  let usesSummarizedThinking: boolean =
    major > 4 || (major === 4 && minor >= 7);

  return usesSummarizedThinking;
}
