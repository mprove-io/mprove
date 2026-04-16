import { z } from 'zod';
import { ControlClassEnum } from '#common/enums/control-class.enum';
import { zFractionControlOption } from '#common/zod/blockml/fraction-control-option';

// TODO: `value`, `label`, `required`, `isMetricsDate` tightened (removed
// `.nullish()`) to match the `FractionControl` interface's required TS
// fields so zod-typed fractions flow into node-common helpers without extra
// `as any` casts. Revisit once node-common migrates to zod types.
export let zFractionControl = z
  .object({
    options: z.array(zFractionControlOption),
    value: z.any(),
    label: z.string(),
    required: z.string(),
    name: z.string(),
    controlClass: z.enum(ControlClassEnum),
    isMetricsDate: z.boolean()
  })
  .meta({ id: 'FractionControl' });

export type FractionControl = z.infer<typeof zFractionControl>;
