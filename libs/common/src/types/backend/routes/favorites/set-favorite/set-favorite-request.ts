import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { FavoriteType } from '#common/types/backend/parts/favorite/favorite-type';
import { zFavoriteType } from '#common/types/backend/parts/favorite/favorite-type';

export type ToBackendSetFavoriteRequest = {
  operation: 'setFavorite';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    type: FavoriteType;
    targetId: string;
    isFavorite: boolean;
  };
};

export let zToBackendSetFavoriteRequest = z
  .strictObject({
    operation: z.literal('setFavorite'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        type: zFavoriteType,
        targetId: z.string(),
        isFavorite: z.boolean()
      })
      .meta({ id: 'ToBackendSetFavoriteInput' })
  })
  .meta({ id: 'ToBackendSetFavoriteRequest' });

assertTypesEqual<
  ToBackendSetFavoriteRequest,
  z.infer<typeof zToBackendSetFavoriteRequest>
>({ value: true });
