import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const anthropicModelVariantValues = [
  'low',
  'medium',
  'high',
  'xhigh',
  'max'
] as const;

export type AnthropicModelVariant =
  (typeof anthropicModelVariantValues)[number];

export let zAnthropicModelVariant = z.enum(anthropicModelVariantValues);

assertTypesEqual<AnthropicModelVariant, z.infer<typeof zAnthropicModelVariant>>(
  {
    value: true
  }
);
