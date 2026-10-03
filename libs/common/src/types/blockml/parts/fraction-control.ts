import { z } from 'zod';
import { ControlClassEnum } from '#common/enums/control-class.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FractionControlOption,
  zFractionControlOption
} from '#common/types/blockml/parts/fraction-control-option';
import type { EnumValues } from '#common/types/enum-values';

export type FractionControl = {
  options?: FractionControlOption[];
  value?: any;
  label?: string;
  required?: string;
  name: string;
  controlClass: EnumValues<typeof ControlClassEnum>;
  isMetricsDate?: boolean;
};

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

assertTypesEqual<FractionControl, z.infer<typeof zFractionControl>>({
  value: true
});
