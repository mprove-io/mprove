import type { ProviderOptionsAnthropic } from '#common/types/backend/parts/provider-options/provider-options-anthropic';
import type { ProviderOptionsCodex } from '#common/types/backend/parts/provider-options/provider-options-codex';
import type { ProviderOptionsOpenAI } from '#common/types/backend/parts/provider-options/provider-options-openai';
import type { ProviderOptionsOpenAICompatible } from '#common/types/backend/parts/provider-options/provider-options-openai-compatible';

export type ProviderSt = {
  name: string;
  options?:
    | ProviderOptionsOpenAI
    | ProviderOptionsAnthropic
    | ProviderOptionsOpenAICompatible
    | ProviderOptionsCodex;
};
