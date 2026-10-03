import { z } from 'zod';
import { FractionLogicEnum } from '#common/enums/fraction/fraction-logic.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FileFractionControl,
  zFileFractionControl
} from '#common/types/blockml/parts/internal/file-fraction-control';
import type { EnumValues } from '#common/types/enum-values';

export type FileFraction = {
  logic?: EnumValues<typeof FractionLogicEnum>;
  logic_line_num?: number;
  type?: string;
  type_line_num?: number;
  controls?: FileFractionControl[];
  controls_line_num?: number;
};

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

assertTypesEqual<FileFraction, z.infer<typeof zFileFraction>>({ value: true });
