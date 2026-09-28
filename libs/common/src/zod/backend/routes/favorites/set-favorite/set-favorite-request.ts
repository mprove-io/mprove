import { z } from 'zod';
import { FavoriteTypeEnum } from '#common/enums/favorite-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetFavoriteRequest = {
  operation: 'setFavorite';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    type:
      | FavoriteTypeEnum.Report
      | FavoriteTypeEnum.Dashboard
      | FavoriteTypeEnum.Chart;
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
        type: z.enum(FavoriteTypeEnum),
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
