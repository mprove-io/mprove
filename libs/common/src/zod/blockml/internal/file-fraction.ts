import { z } from 'zod';
import { FractionLogicEnum } from '#common/enums/fraction/fraction-logic.enum';
import { zFileFractionControl } from '#common/zod/blockml/internal/file-fraction-control';

export let zFileFraction = z
  .object({
    logic: z.enum(FractionLogicEnum).nullish(),
    logic_line_num: z.number().nullish(),
    type: z.string().nullish(),
    type_line_num: z.number().nullish(),
    controls: z.array(zFileFractionControl).nullish(),
    controls_line_num: z.number().nullish()
  })
  .meta({ id: 'FileFraction' });

export type FileFraction = z.infer<typeof zFileFraction>;
