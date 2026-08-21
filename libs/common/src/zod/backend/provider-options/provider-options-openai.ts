import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ProviderOptionsOpenAI = {
  apiKey?: string;
};

export let zProviderOptionsOpenAI = z
  .strictObject({
    apiKey: z.string().nullish()
  })
  .meta({ id: 'ProviderOptionsOpenAI' });

assertTypesEqual<ProviderOptionsOpenAI, z.infer<typeof zProviderOptionsOpenAI>>(
  { value: true }
);
