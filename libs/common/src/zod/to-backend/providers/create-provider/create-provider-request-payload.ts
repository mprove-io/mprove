import { z } from 'zod';
import {
  ANTHROPIC_PROVIDER_ID,
  CODEX_PROVIDER_ID,
  OPENAI_PROVIDER_ID,
  RESERVED_PROVIDER_IDS
} from '#common/constants/providers';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ProviderOptionsAnthropic,
  zProviderOptionsAnthropic
} from '#common/zod/backend/provider-options/provider-options-anthropic';
import { zProviderOptionsCodex } from '#common/zod/backend/provider-options/provider-options-codex';
import {
  type ProviderOptionsOpenAI,
  zProviderOptionsOpenAI
} from '#common/zod/backend/provider-options/provider-options-openai';
import { zProviderOptionsOpenAICompatible } from '#common/zod/backend/provider-options/provider-options-openai-compatible';

export type ToBackendCreateProviderRequestPayload =
  | {
      type: ProviderTypeEnum.Anthropic;
      projectId: string;
      providerId: typeof ANTHROPIC_PROVIDER_ID;
      options: Extend<ProviderOptionsAnthropic, { apiKey: string }>;
    }
  | {
      type: ProviderTypeEnum.OpenAI;
      projectId: string;
      providerId: typeof OPENAI_PROVIDER_ID;
      options: Extend<ProviderOptionsOpenAI, { apiKey: string }>;
    }
  | {
      type: ProviderTypeEnum.OpenAICompatible;
      name: string;
      projectId: string;
      providerId: string;
      options: {
        baseURL: string;
        apiKey?: string;
        headers?: { key: string; value: string }[];
        queryParams?: { key: string; value: string }[];
      };
    }
  | {
      type: ProviderTypeEnum.OpenAICodex;
      projectId: string;
      providerId: typeof CODEX_PROVIDER_ID;
      options: Record<string, never>;
    };

export let zToBackendCreateProviderRequestPayload = z
  .discriminatedUnion('type', [
    z.strictObject({
      type: z.literal(ProviderTypeEnum.OpenAI),
      projectId: z.string(),
      providerId: z.literal(OPENAI_PROVIDER_ID),
      options: zProviderOptionsOpenAI.extend({
        apiKey: z.string().trim().min(1)
      })
    }),
    z.strictObject({
      type: z.literal(ProviderTypeEnum.Anthropic),
      projectId: z.string(),
      providerId: z.literal(ANTHROPIC_PROVIDER_ID),
      options: zProviderOptionsAnthropic.extend({
        apiKey: z.string().trim().min(1)
      })
    }),
    z.strictObject({
      type: z.literal(ProviderTypeEnum.OpenAICompatible),
      name: z.string().trim().min(1).max(100),
      projectId: z.string(),
      providerId: z
        .string()
        .max(32)
        .regex(/^[a-z0-9][a-z0-9-_]*$/, {
          message:
            'providerId must start with a lowercase letter or digit and contain only lowercase letters, digits, hyphens or underscores'
        })
        .refine(value => !RESERVED_PROVIDER_IDS.includes(value), {
          message: 'providerId is reserved for a built-in provider'
        }),
      options: zProviderOptionsOpenAICompatible
    }),
    z.strictObject({
      type: z.literal(ProviderTypeEnum.OpenAICodex),
      projectId: z.string(),
      providerId: z.literal(CODEX_PROVIDER_ID),
      options: zProviderOptionsCodex
    })
  ])
  .meta({ id: 'ToBackendCreateProviderRequestPayload' });

assertTypesEqual<
  ToBackendCreateProviderRequestPayload,
  z.infer<typeof zToBackendCreateProviderRequestPayload>
>({ value: true });
