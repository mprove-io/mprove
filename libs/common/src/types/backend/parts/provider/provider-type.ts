import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const providerTypeValues = [
  'Anthropic',
  'OpenAI',
  'OpenAICodex',
  'OpenAICompatible'
] as const;

export type ProviderType = (typeof providerTypeValues)[number];

export let zProviderType = z.enum(providerTypeValues);

assertTypesEqual<ProviderType, z.infer<typeof zProviderType>>({
  value: true
});
