import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const modelCatalogProviderTypeValues = [
  'OpenAI',
  'Anthropic',
  'OpenAICodex'
] as const;

export type ModelCatalogProviderType =
  (typeof modelCatalogProviderTypeValues)[number];

export let zModelCatalogProviderType = z.enum(modelCatalogProviderTypeValues);

assertTypesEqual<
  ModelCatalogProviderType,
  z.infer<typeof zModelCatalogProviderType>
>({ value: true });
