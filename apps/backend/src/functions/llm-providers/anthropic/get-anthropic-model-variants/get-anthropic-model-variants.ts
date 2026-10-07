import type Anthropic from '@anthropic-ai/sdk';
import {
  type AnthropicModelVariant,
  anthropicModelVariantValues
} from '#backend/types/anthropic-model-variant';

export type { AnthropicModelVariant } from '#backend/types/anthropic-model-variant';
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
  let variants: AnthropicModelVariant[] = anthropicModelVariantValues.filter(
    effort => {
      let effortCapabilities = anthropicModel.capabilities?.effort;
      if (effortCapabilities?.supported !== true) {
        return false;
      }
      let capability = effortCapabilities[effort];
      return capability?.supported === true;
    }
  );
  return variants;
}
