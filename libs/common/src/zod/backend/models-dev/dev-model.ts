import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

// Model entry returned by the models.dev API.
export type DevModel = {
  id: string;
  name: string;
  family?: string;
  release_date: string;
  attachment: boolean;
  reasoning: boolean;
  temperature?: boolean;
  tool_call: boolean;
  interleaved?: true | { field: 'reasoning_content' | 'reasoning_details' };
  cost?: {
    input: number;
    output: number;
    cache_read?: number;
    cache_write?: number;
    context_over_200k?: {
      input: number;
      output: number;
      cache_read?: number;
      cache_write?: number;
    };
  };
  limit: { context: number; input?: number; output: number };
  modalities?: {
    input: ('text' | 'audio' | 'image' | 'video' | 'pdf')[];
    output: ('text' | 'audio' | 'image' | 'video' | 'pdf')[];
  };
  experimental?: boolean | Record<string, unknown>;
  status?: 'alpha' | 'beta' | 'deprecated';
  options?: Record<string, unknown>;
  headers?: Record<string, string>;
  provider?: { npm?: string; api?: string };
  variants?: Record<string, Record<string, unknown>>;
};

let zModality = z.enum(['text', 'audio', 'image', 'video', 'pdf']);

export let zDevModel = z
  .object({
    id: z.string(),
    name: z.string(),
    family: z.string().nullish(),
    release_date: z.string(),
    attachment: z.boolean(),
    reasoning: z.boolean(),
    temperature: z.boolean().nullish(),
    tool_call: z.boolean(),
    interleaved: z
      .union([
        z.literal(true),
        z.strictObject({
          field: z.enum(['reasoning_content', 'reasoning_details'])
        })
      ])
      .nullish(),
    cost: z
      .object({
        input: z.number(),
        output: z.number(),
        cache_read: z.number().nullish(),
        cache_write: z.number().nullish(),
        context_over_200k: z
          .object({
            input: z.number(),
            output: z.number(),
            cache_read: z.number().nullish(),
            cache_write: z.number().nullish()
          })
          .nullish()
      })
      .nullish(),
    limit: z.object({
      context: z.number(),
      input: z.number().nullish(),
      output: z.number()
    }),
    modalities: z
      .object({
        input: z.array(zModality),
        output: z.array(zModality)
      })
      .nullish(),
    experimental: z
      .union([z.boolean(), z.record(z.string(), z.unknown())])
      .nullish(),
    status: z.enum(['alpha', 'beta', 'deprecated']).nullish(),
    options: z.record(z.string(), z.unknown()).nullish(),
    headers: z.record(z.string(), z.string()).nullish(),
    provider: z
      .object({
        npm: z.string().nullish(),
        api: z.string().nullish()
      })
      .nullish(),
    variants: z.record(z.string(), z.record(z.string(), z.unknown())).nullish()
  })
  .meta({ id: 'DevModel' });

assertTypesEqual<DevModel, z.infer<typeof zDevModel>>({
  value: true
});
