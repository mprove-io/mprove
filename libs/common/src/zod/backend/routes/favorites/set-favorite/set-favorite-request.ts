import { z } from 'zod';
import { FavoriteTypeEnum } from '#common/enums/favorite-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetFavoriteInput = {
  projectId: string;
  type:
    | FavoriteTypeEnum.Report
    | FavoriteTypeEnum.Dashboard
    | FavoriteTypeEnum.Chart;
  targetId: string;
  isFavorite: boolean;
};

export type ToBackendSetFavoriteRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSetFavoriteInput;
};

export let zToBackendSetFavoriteInput = z
  .object({
    projectId: z.string(),
    type: z.enum(FavoriteTypeEnum),
    targetId: z.string(),
    isFavorite: z.boolean()
  })
  .meta({ id: 'ToBackendSetFavoriteInput' });

export let zToBackendSetFavoriteRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendSetFavoriteInput
  })
  .meta({ id: 'ToBackendSetFavoriteRequest' });

assertTypesEqual<
  ToBackendSetFavoriteInput,
  z.infer<typeof zToBackendSetFavoriteInput>
>({ value: true });

assertTypesEqual<
  ToBackendSetFavoriteRequest,
  z.infer<typeof zToBackendSetFavoriteRequest>
>({ value: true });
