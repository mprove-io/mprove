import { z } from 'zod';
import { ControlClassEnum } from '#common/enums/control-class.enum';
import { zFractionControlOption } from '#common/zod/blockml/fraction-control-option';

export let zFractionControl = z
  .object({
    options: z.array(zFractionControlOption).nullish(),
    value: z.any().nullish(),
    label: z.string().nullish(),
    required: z.string().nullish(),
    name: z.string(),
    controlClass: z.enum(ControlClassEnum),
    isMetricsDate: z.boolean().nullish()
  })
  .meta({ id: 'FractionControl' });

export type FractionControl = z.infer<typeof zFractionControl>;
