import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const favoriteTypeValues = ['Report', 'Dashboard', 'Chart'] as const;

export type FavoriteType = (typeof favoriteTypeValues)[number];

export let zFavoriteType = z.enum(favoriteTypeValues);

assertTypesEqual<FavoriteType, z.infer<typeof zFavoriteType>>({
  value: true
});
