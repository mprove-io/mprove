import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ControlClass,
  zControlClass
} from '#common/types/blockml/parts/fraction/control-class';
import {
  type FractionControlOption,
  zFractionControlOption
} from '#common/types/blockml/parts/fraction/fraction-control-option';

export type FractionControl = {
  options?: FractionControlOption[];
  value?: any;
  label?: string;
  required?: string;
  name: string;
  controlClass: ControlClass;
  isMetricsDate?: boolean;
};

export let zFractionControl = z
  .object({
    options: z.array(zFractionControlOption).nullish(),
    value: z.any().nullish(),
    label: z.string().nullish(),
    required: z.string().nullish(),
    name: z.string(),
    controlClass: zControlClass,
    isMetricsDate: z.boolean().nullish()
  })
  .meta({ id: 'FractionControl' });

assertTypesEqual<FractionControl, z.infer<typeof zFractionControl>>({
  value: true
});
