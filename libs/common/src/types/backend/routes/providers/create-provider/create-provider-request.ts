import { z } from 'zod';
import {
  ANTHROPIC_PROVIDER_ID,
  CODEX_PROVIDER_ID,
  OPENAI_PROVIDER_ID,
  RESERVED_PROVIDER_IDS
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
import type { Extend } from '#common/types/extend';

export type ToBackendCreateProviderRequest = {
  operation: 'createProvider';
  traceId: string;
  idempotencyKey: string;
  input:
    | {
        type: 'OpenAI';
        projectId: string;
        providerId: typeof OPENAI_PROVIDER_ID;
        options: Extend<
          ProviderOptionsOpenAI,
          {
            apiKey: string;
          }
        >;
      }
    | {
        type: 'Anthropic';
        projectId: string;
        providerId: typeof ANTHROPIC_PROVIDER_ID;
        options: Extend<
          ProviderOptionsAnthropic,
          {
            apiKey: string;
          }
        >;
      }
    | {
        type: 'OpenAICompatible';
        name: string;
        projectId: string;
        providerId: string;
        options: ProviderOptionsOpenAICompatible;
      }
    | {
        type: 'OpenAICodex';
        projectId: string;
        providerId: typeof CODEX_PROVIDER_ID;
        options: ProviderOptionsCodex;
      };
};

export let zToBackendCreateProviderRequest = z
  .strictObject({
    operation: z.literal('createProvider'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .discriminatedUnion('type', [
        z.strictObject({
          type: z.literal('OpenAI' satisfies ProviderType),
          projectId: z.string(),
          providerId: z.literal(OPENAI_PROVIDER_ID),
          options: zProviderOptionsOpenAI.extend({
            apiKey: z.string().trim().min(1)
          })
        }),
        z.strictObject({
          type: z.literal('Anthropic' satisfies ProviderType),
          projectId: z.string(),
          providerId: z.literal(ANTHROPIC_PROVIDER_ID),
          options: zProviderOptionsAnthropic.extend({
            apiKey: z.string().trim().min(1)
          })
        }),
        z.strictObject({
          type: z.literal('OpenAICompatible' satisfies ProviderType),
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
          type: z.literal('OpenAICodex' satisfies ProviderType),
          projectId: z.string(),
          providerId: z.literal(CODEX_PROVIDER_ID),
          options: zProviderOptionsCodex
        })
      ])
      .meta({ id: 'ToBackendCreateProviderInput' })
  })
  .transform(item => ({
    operation: item.operation,
    traceId: item.traceId,
    idempotencyKey: item.idempotencyKey,
    input: item.input
  }))
  .meta({ id: 'ToBackendCreateProviderRequest' });

assertTypesEqual<
  ToBackendCreateProviderRequest,
  z.infer<typeof zToBackendCreateProviderRequest>
>({ value: true });
