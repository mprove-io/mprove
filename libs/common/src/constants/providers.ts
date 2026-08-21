import { ProviderTypeEnum } from '#common/enums/provider-type.enum';

export const OPENAI_PROVIDER_ID = 'openai';
export const ANTHROPIC_PROVIDER_ID = 'anthropic';
export const CODEX_PROVIDER_ID = 'openai-codex';
export const ZEN_PROVIDER_ID = 'opencode';

export const ANTHROPIC_PROVIDER_NAME = 'Anthropic';
export const OPENAI_PROVIDER_NAME = 'OpenAI';
export const CODEX_PROVIDER_NAME = 'OpenAI Codex';
export const ZEN_PROVIDER_NAME = 'Zen';

export const OPENAI_COMPATIBLE_PROVIDER_TYPE_NAME = 'OpenAI Compatible';

export const PROVIDER_NAME_BY_ID: Readonly<Record<string, string>> = {
  [OPENAI_PROVIDER_ID]: OPENAI_PROVIDER_NAME,
  [ANTHROPIC_PROVIDER_ID]: ANTHROPIC_PROVIDER_NAME,
  [CODEX_PROVIDER_ID]: CODEX_PROVIDER_NAME,
  [ZEN_PROVIDER_ID]: ZEN_PROVIDER_NAME
};

export const PROVIDER_TYPE_BY_ID: Readonly<
  Partial<Record<string, ProviderTypeEnum>>
> = {
  [OPENAI_PROVIDER_ID]: ProviderTypeEnum.OpenAI,
  [ANTHROPIC_PROVIDER_ID]: ProviderTypeEnum.Anthropic,
  [CODEX_PROVIDER_ID]: ProviderTypeEnum.OpenAICodex
};

export const PROVIDER_TYPE_NAME_BY_TYPE: Readonly<
  Record<ProviderTypeEnum, string>
> = {
  [ProviderTypeEnum.OpenAI]: OPENAI_PROVIDER_NAME,
  [ProviderTypeEnum.Anthropic]: ANTHROPIC_PROVIDER_NAME,
  [ProviderTypeEnum.OpenAICodex]: CODEX_PROVIDER_NAME,
  [ProviderTypeEnum.OpenAICompatible]: OPENAI_COMPATIBLE_PROVIDER_TYPE_NAME
};

export const RESERVED_PROVIDER_IDS: string[] = [
  OPENAI_PROVIDER_ID,
  ANTHROPIC_PROVIDER_ID,
  CODEX_PROVIDER_ID
];
