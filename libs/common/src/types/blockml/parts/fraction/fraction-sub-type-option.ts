import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FractionLogic,
  zFractionLogic
} from '#common/types/blockml/parts/fraction/fraction-logic';

export type FractionSubTypeOption = {
  logicGroup?: FractionLogic;
  typeValue: string;
  value: string;
  label?: string;
};

export let zFractionSubTypeOption = z
  .object({
    logicGroup: zFractionLogic.nullish(),
    typeValue: z.string(),
    value: z.string(),
    label: z.string().nullish()
  })
  .meta({ id: 'FractionSubTypeOption' });

assertTypesEqual<FractionSubTypeOption, z.infer<typeof zFractionSubTypeOption>>(
  { value: true }
);
