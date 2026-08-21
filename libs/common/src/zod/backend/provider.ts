import { z } from 'zod';
import {
  ANTHROPIC_PROVIDER_ID,
  CODEX_PROVIDER_ID,
  OPENAI_PROVIDER_ID,
  RESERVED_PROVIDER_IDS
} from '#common/constants/providers';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type LlmModel,
  zLlmModel
} from '#common/zod/backend/llm-models/llm-model';
import {
  type ProviderOptionsAnthropic,
  zProviderOptionsAnthropic
} from '#common/zod/backend/provider-options/provider-options-anthropic';
import {
  type ProviderOptionsCodex,
  zProviderOptionsCodex
} from '#common/zod/backend/provider-options/provider-options-codex';
import {
  type ProviderOptionsOpenAI,
  zProviderOptionsOpenAI
} from '#common/zod/backend/provider-options/provider-options-openai';
import {
  type ProviderOptionsOpenAICompatible,
  zProviderOptionsOpenAICompatible
} from '#common/zod/backend/provider-options/provider-options-openai-compatible';

export type Provider =
  | {
      type: ProviderTypeEnum.OpenAI;
      name: string;
      projectId: string;
      providerId: typeof OPENAI_PROVIDER_ID;
      isEnabled: boolean;
      models: LlmModel[];
      options: ProviderOptionsOpenAI;
      serverTs?: number;
    }
  | {
      type: ProviderTypeEnum.Anthropic;
      name: string;
      projectId: string;
      providerId: typeof ANTHROPIC_PROVIDER_ID;
      isEnabled: boolean;
      models: LlmModel[];
      options: ProviderOptionsAnthropic;
      serverTs?: number;
    }
  | {
      type: ProviderTypeEnum.OpenAICompatible;
      name: string;
      projectId: string;
      providerId: string;
      isEnabled: boolean;
      models: LlmModel[];
      options: ProviderOptionsOpenAICompatible;
      serverTs?: number;
    }
  | {
      type: ProviderTypeEnum.OpenAICodex;
      name: string;
      projectId: string;
      providerId: typeof CODEX_PROVIDER_ID;
      isEnabled: boolean;
      models: LlmModel[];
      options: ProviderOptionsCodex;
      serverTs?: number;
    };

export let zProvider = z
  .discriminatedUnion('type', [
    z.strictObject({
      type: z.literal(ProviderTypeEnum.OpenAI),
      name: z.string(),
      projectId: z.string(),
      providerId: z.literal(OPENAI_PROVIDER_ID),
      isEnabled: z.boolean(),
      models: z.array(zLlmModel),
      options: zProviderOptionsOpenAI,
      serverTs: z.number().int().nullish()
    }),
    z.strictObject({
      type: z.literal(ProviderTypeEnum.Anthropic),
      name: z.string(),
      projectId: z.string(),
      providerId: z.literal(ANTHROPIC_PROVIDER_ID),
      isEnabled: z.boolean(),
      models: z.array(zLlmModel),
      options: zProviderOptionsAnthropic,
      serverTs: z.number().int().nullish()
    }),
    z.strictObject({
      type: z.literal(ProviderTypeEnum.OpenAICompatible),
      name: z.string(),
      projectId: z.string(),
      providerId: z
        .string()
        .max(32)
        .regex(/^[a-z0-9][a-z0-9-_]*$/)
        .refine(value => !RESERVED_PROVIDER_IDS.includes(value), {
          message: 'providerId is reserved for a built-in provider'
        }),
      isEnabled: z.boolean(),
      models: z.array(zLlmModel),
      options: zProviderOptionsOpenAICompatible,
      serverTs: z.number().int().nullish()
    }),
    z.strictObject({
      type: z.literal(ProviderTypeEnum.OpenAICodex),
      name: z.string(),
      projectId: z.string(),
      providerId: z.literal(CODEX_PROVIDER_ID),
      isEnabled: z.boolean(),
      models: z.array(zLlmModel),
      options: zProviderOptionsCodex,
      serverTs: z.number().int().nullish()
    })
  ])
  .meta({ id: 'Provider' });

assertTypesEqual<Provider, z.infer<typeof zProvider>>({ value: true });
