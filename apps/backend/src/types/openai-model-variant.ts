import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const openAiModelVariantValues = [
  'none',
  'minimal',
  'low',
  'medium',
  'high',
  'xhigh'
] as const;

export type OpenAiModelVariant = (typeof openAiModelVariantValues)[number];

export let zOpenAiModelVariant = z.enum(openAiModelVariantValues);

assertTypesEqual<OpenAiModelVariant, z.infer<typeof zOpenAiModelVariant>>({
  value: true
});
