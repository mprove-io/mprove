import { z } from 'zod';
import { ControlClassEnum } from '#common/enums/control-class.enum';
import { zFractionControlOption } from '#common/zod/z-query-info/z-fraction-control-option';

export let zFractionControl = z.object({
  options: z.array(zFractionControlOption).nullish(),
  value: z.any().nullish(),
  label: z.string().nullish(),
  required: z.string().nullish(),
  name: z.string().nullish(),
  controlClass: z.enum(ControlClassEnum).nullish(),
  isMetricsDate: z.boolean().nullish()
});
