import { z } from 'zod';
import {
  ANTHROPIC_PROVIDER_ID,
  CODEX_PROVIDER_ID,
  OPENAI_PROVIDER_ID
} from '#common/constants/providers';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ProviderOptionsAnthropic,
  zProviderOptionsAnthropic
} from '#common/types/backend/parts/provider/options/provider-options-anthropic';
import {
  type ProviderOptionsCodex,
  zProviderOptionsCodex
} from '#common/types/backend/parts/provider/options/provider-options-codex';
import {
  type ProviderOptionsOpenAI,
  zProviderOptionsOpenAI
} from '#common/types/backend/parts/provider/options/provider-options-openai';
import {
  type ProviderOptionsOpenAICompatible,
  zProviderOptionsOpenAICompatible
} from '#common/types/backend/parts/provider/options/provider-options-openai-compatible';
import type { ProviderType } from '#common/types/backend/parts/provider/provider-type';
import {
  type ToBackendSeedRecordsModel,
  zToBackendSeedRecordsModel
} from '#common/types/backend/parts/test-routes/to-backend-seed-records-model';

export type ToBackendSeedRecordsInputProvidersItem =
  | {
      type: 'OpenAI';
      projectId: string;
      providerId: typeof OPENAI_PROVIDER_ID;
      isEnabled: boolean;
      models: ToBackendSeedRecordsModel[];
      options: ProviderOptionsOpenAI;
    }
  | {
      type: 'Anthropic';
      projectId: string;
      providerId: typeof ANTHROPIC_PROVIDER_ID;
      isEnabled: boolean;
      models: ToBackendSeedRecordsModel[];
      options: ProviderOptionsAnthropic;
    }
  | {
      type: 'OpenAICompatible';
      projectId: string;
      providerId: string;
      name: string;
      isEnabled: boolean;
      models: ToBackendSeedRecordsModel[];
      options: ProviderOptionsOpenAICompatible;
    }
  | {
      type: 'OpenAICodex';
      projectId: string;
      providerId: typeof CODEX_PROVIDER_ID;
      isEnabled: boolean;
      models: ToBackendSeedRecordsModel[];
      options: ProviderOptionsCodex;
    };

export let zToBackendSeedRecordsInputProvidersItem = z
  .discriminatedUnion('type', [
    z.strictObject({
      type: z.literal('OpenAI' satisfies ProviderType),
      projectId: z.string(),
      providerId: z.literal(OPENAI_PROVIDER_ID),
      isEnabled: z.boolean(),
      models: z.array(zToBackendSeedRecordsModel),
      options: zProviderOptionsOpenAI
    }),
    z.strictObject({
      type: z.literal('Anthropic' satisfies ProviderType),
      projectId: z.string(),
      providerId: z.literal(ANTHROPIC_PROVIDER_ID),
      isEnabled: z.boolean(),
      models: z.array(zToBackendSeedRecordsModel),
      options: zProviderOptionsAnthropic
    }),
    z.strictObject({
      type: z.literal('OpenAICompatible' satisfies ProviderType),
      projectId: z.string(),
      providerId: z.string(),
      name: z.string(),
      isEnabled: z.boolean(),
      models: z.array(zToBackendSeedRecordsModel),
      options: zProviderOptionsOpenAICompatible
    }),
    z.strictObject({
      type: z.literal('OpenAICodex' satisfies ProviderType),
      projectId: z.string(),
      providerId: z.literal(CODEX_PROVIDER_ID),
      isEnabled: z.boolean(),
      models: z.array(zToBackendSeedRecordsModel),
      options: zProviderOptionsCodex
    })
  ])
  .meta({ id: 'ToBackendSeedRecordsInputProvidersItem' });

assertTypesEqual<
  ToBackendSeedRecordsInputProvidersItem,
  z.infer<typeof zToBackendSeedRecordsInputProvidersItem>
>({ value: true });
