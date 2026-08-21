import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ProviderOptionsAnthropic = {
  apiKey?: string;
};

export let zProviderOptionsAnthropic = z
  .strictObject({
    apiKey: z.string().nullish()
  })
  .meta({ id: 'ProviderOptionsAnthropic' });

assertTypesEqual<
  ProviderOptionsAnthropic,
  z.infer<typeof zProviderOptionsAnthropic>
>({ value: true });
