import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ProviderOptionsOpenAICompatible = {
  baseURL: string;
  apiKey?: string;
  headers?: { key: string; value: string }[];
  queryParams?: { key: string; value: string }[];
};

export let zProviderOptionsOpenAICompatible = z
  .strictObject({
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
  .meta({ id: 'ProviderOptionsOpenAICompatible' });

assertTypesEqual<
  ProviderOptionsOpenAICompatible,
  z.infer<typeof zProviderOptionsOpenAICompatible>
>({ value: true });
