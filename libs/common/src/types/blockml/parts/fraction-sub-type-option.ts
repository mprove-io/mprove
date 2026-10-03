import { z } from 'zod';
import { FractionLogicEnum } from '#common/enums/fraction/fraction-logic.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type FractionSubTypeOption = {
  logicGroup?: EnumValues<typeof FractionLogicEnum>;
  typeValue: string;
  value: string;
  label?: string;
};

export let zFractionSubTypeOption = z
  .object({
    logicGroup: z.enum(FractionLogicEnum).nullish(),
    typeValue: z.string(),
    value: z.string(),
    label: z.string().nullish()
  })
  .meta({ id: 'FractionSubTypeOption' });

assertTypesEqual<FractionSubTypeOption, z.infer<typeof zFractionSubTypeOption>>(
  { value: true }
);
