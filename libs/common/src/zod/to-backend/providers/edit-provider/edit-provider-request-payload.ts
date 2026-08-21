import { z } from 'zod';
import {
  ANTHROPIC_PROVIDER_ID,
  CODEX_PROVIDER_ID,
  OPENAI_PROVIDER_ID,
  RESERVED_PROVIDER_IDS
} from '#common/constants/providers';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import { zProviderOptionsAnthropic } from '#common/zod/backend/provider-options/provider-options-anthropic';
import { zProviderOptionsCodex } from '#common/zod/backend/provider-options/provider-options-codex';
import { zProviderOptionsOpenAI } from '#common/zod/backend/provider-options/provider-options-openai';

export type ToBackendEditProviderRequestPayload =
  | {
      projectId: string;
      providerId: typeof OPENAI_PROVIDER_ID;
      options: { apiKey?: string };
    }
  | {
      projectId: string;
      providerId: typeof ANTHROPIC_PROVIDER_ID;
      options: { apiKey?: string };
    }
  | {
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
      projectId: string;
      providerId: typeof CODEX_PROVIDER_ID;
      options: Record<string, never>;
    };

export let zToBackendEditProviderRequestPayload = z
  .union([
    z.strictObject({
      projectId: z.string(),
      providerId: z.literal(OPENAI_PROVIDER_ID),
      options: zProviderOptionsOpenAI
    }),
    z.strictObject({
      projectId: z.string(),
      providerId: z.literal(ANTHROPIC_PROVIDER_ID),
      options: zProviderOptionsAnthropic
    }),
    z.strictObject({
      name: z.string().trim().min(1).max(100),
      projectId: z.string(),
      providerId: z
        .string()
        .refine(value => !RESERVED_PROVIDER_IDS.includes(value), {
          message: 'providerId is reserved for a built-in provider'
        }),
      options: z.strictObject({
        baseURL: z.string().trim().min(1),
        apiKey: z.string().nullish(),
        headers: z
          .array(
            z.strictObject({
              key: z.string().trim().min(1),
              value: z.string()
            })
          )
          .nullish(),
        queryParams: z
          .array(
            z.strictObject({
              key: z.string().trim().min(1),
              value: z.string()
            })
          )
          .nullish()
      })
    }),
    z.strictObject({
      projectId: z.string(),
      providerId: z.literal(CODEX_PROVIDER_ID),
      options: zProviderOptionsCodex
    })
  ])
  .meta({ id: 'ToBackendEditProviderRequestPayload' });

assertTypesEqual<
  ToBackendEditProviderRequestPayload,
  z.infer<typeof zToBackendEditProviderRequestPayload>
>({ value: true });
