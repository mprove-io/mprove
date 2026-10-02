import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ProviderOptionsAnthropic,
  zProviderOptionsAnthropic
} from '#common/types/backend/parts/provider-options/provider-options-anthropic';
import {
  type ProviderOptionsCodex,
  zProviderOptionsCodex
} from '#common/types/backend/parts/provider-options/provider-options-codex';
import {
  type ProviderOptionsOpenAI,
  zProviderOptionsOpenAI
} from '#common/types/backend/parts/provider-options/provider-options-openai';
import {
  type ProviderOptionsOpenAICompatible,
  zProviderOptionsOpenAICompatible
} from '#common/types/backend/parts/provider-options/provider-options-openai-compatible';

export type ProviderSt = {
  name: string;
  options?:
    | ProviderOptionsOpenAI
    | ProviderOptionsAnthropic
    | ProviderOptionsOpenAICompatible
    | ProviderOptionsCodex;
};

export let zProviderSt = z
  .strictObject({
    name: z.string(),
    options: z.union([
      zProviderOptionsOpenAI,
      zProviderOptionsAnthropic,
      zProviderOptionsOpenAICompatible,
      zProviderOptionsCodex
    ])
  })
  .meta({ id: 'ProviderSt' });

assertTypesEqual<ProviderSt, z.infer<typeof zProviderSt>>({ value: true });
