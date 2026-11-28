import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type CatalogSearchField = {
  id: string;
  label: string;
};

export const zCatalogSearchField = z.object({
  id: z.string(),
  label: z.string()
});

assertTypesEqual<CatalogSearchField, z.infer<typeof zCatalogSearchField>>({
  value: true
});
