import { z } from 'zod';
import {
  ANTHROPIC_PROVIDER_ID,
  CODEX_PROVIDER_ID,
  OPENAI_PROVIDER_ID
} from '#common/constants/providers';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
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
import {
  type ToBackendSeedRecordsModel,
  zToBackendSeedRecordsModel
} from '#common/zod/backend/test-routes/to-backend-seed-records-model';

export type ToBackendSeedRecordsInputProvidersItem =
  | {
      projectId: string;
      providerId: typeof OPENAI_PROVIDER_ID;
      type: ProviderTypeEnum.OpenAI;
      isEnabled: boolean;
      models: ToBackendSeedRecordsModel[];
      options: ProviderOptionsOpenAI;
    }
  | {
      projectId: string;
      providerId: typeof ANTHROPIC_PROVIDER_ID;
      type: ProviderTypeEnum.Anthropic;
      isEnabled: boolean;
      models: ToBackendSeedRecordsModel[];
      options: ProviderOptionsAnthropic;
    }
  | {
      projectId: string;
      providerId: string;
      type: ProviderTypeEnum.OpenAICompatible;
      name: string;
      isEnabled: boolean;
      models: ToBackendSeedRecordsModel[];
      options: ProviderOptionsOpenAICompatible;
    }
  | {
      projectId: string;
      providerId: typeof CODEX_PROVIDER_ID;
      type: ProviderTypeEnum.OpenAICodex;
      isEnabled: boolean;
      models: ToBackendSeedRecordsModel[];
      options: ProviderOptionsCodex;
    };

export let zToBackendSeedRecordsInputProvidersItem = z
  .discriminatedUnion('type', [
    z.strictObject({
      projectId: z.string(),
      providerId: z.literal(OPENAI_PROVIDER_ID),
      type: z.literal(ProviderTypeEnum.OpenAI),
      isEnabled: z.boolean(),
      models: z.array(zToBackendSeedRecordsModel),
      options: zProviderOptionsOpenAI
    }),
    z.strictObject({
      projectId: z.string(),
      providerId: z.literal(ANTHROPIC_PROVIDER_ID),
      type: z.literal(ProviderTypeEnum.Anthropic),
      isEnabled: z.boolean(),
      models: z.array(zToBackendSeedRecordsModel),
      options: zProviderOptionsAnthropic
    }),
    z.strictObject({
      projectId: z.string(),
      providerId: z.string(),
      type: z.literal(ProviderTypeEnum.OpenAICompatible),
      name: z.string(),
      isEnabled: z.boolean(),
      models: z.array(zToBackendSeedRecordsModel),
      options: zProviderOptionsOpenAICompatible
    }),
    z.strictObject({
      projectId: z.string(),
      providerId: z.literal(CODEX_PROVIDER_ID),
      type: z.literal(ProviderTypeEnum.OpenAICodex),
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
