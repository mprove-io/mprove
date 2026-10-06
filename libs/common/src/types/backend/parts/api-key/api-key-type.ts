import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const apiKeyTypeValues = ['PK', 'SK'] as const;

export type ApiKeyType = (typeof apiKeyTypeValues)[number];

export let zApiKeyType = z.enum(apiKeyTypeValues);

assertTypesEqual<ApiKeyType, z.infer<typeof zApiKeyType>>({
  value: true
});
