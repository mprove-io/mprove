import type { ProviderType } from '#common/types/backend/parts/provider/provider-type';

export const OPENAI_PROVIDER_ID = 'openai';
export const ANTHROPIC_PROVIDER_ID = 'anthropic';
export const CODEX_PROVIDER_ID = 'openai-codex';

export const ANTHROPIC_PROVIDER_NAME = 'Anthropic';
export const OPENAI_PROVIDER_NAME = 'OpenAI';
export const CODEX_PROVIDER_NAME = 'OpenAI Codex';

export const OPENAI_COMPATIBLE_PROVIDER_TYPE_NAME = 'OpenAI Compatible';

export const PROVIDER_NAME_BY_ID: Readonly<Record<string, string>> = {
  [OPENAI_PROVIDER_ID]: OPENAI_PROVIDER_NAME,
  [ANTHROPIC_PROVIDER_ID]: ANTHROPIC_PROVIDER_NAME,
  [CODEX_PROVIDER_ID]: CODEX_PROVIDER_NAME
};

export const PROVIDER_TYPE_BY_ID: Readonly<
  Partial<Record<string, ProviderType>>
> = {
  [OPENAI_PROVIDER_ID]: 'OpenAI',
  [ANTHROPIC_PROVIDER_ID]: 'Anthropic',
  [CODEX_PROVIDER_ID]: 'OpenAICodex'
};

export const PROVIDER_TYPE_NAME_BY_TYPE: Readonly<
  Record<ProviderType, string>
> = {
  ['OpenAI']: OPENAI_PROVIDER_NAME,
  ['Anthropic']: ANTHROPIC_PROVIDER_NAME,
  ['OpenAICodex']: CODEX_PROVIDER_NAME,
  ['OpenAICompatible']: OPENAI_COMPATIBLE_PROVIDER_TYPE_NAME
};

export const RESERVED_PROVIDER_IDS: string[] = [
  OPENAI_PROVIDER_ID,
  ANTHROPIC_PROVIDER_ID,
  CODEX_PROVIDER_ID
];
