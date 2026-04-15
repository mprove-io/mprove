import { z } from 'zod';
import { FractionLogicEnum } from '#common/enums/fraction/fraction-logic.enum';
import { zFileStoreFractionControl } from '#common/zod/blockml/internal/file-store-fraction-control';

export let zFileStoreFractionType = z
  .object({
    type: z.string().nullish(),
    type_line_num: z.number().nullish(),
    label: z.string().nullish(),
    label_line_num: z.number().nullish(),
    meta: z.any().nullish(),
    meta_line_num: z.number().nullish(),
    controls: z.array(zFileStoreFractionControl).nullish(),
    controls_line_num: z.number().nullish(),
    logicGroup: z.enum(FractionLogicEnum).nullish()
  })
  .meta({ id: 'FileStoreFractionType' });

export type FileStoreFractionType = z.infer<typeof zFileStoreFractionType>;
