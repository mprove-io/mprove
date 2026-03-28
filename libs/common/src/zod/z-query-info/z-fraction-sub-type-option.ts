import { z } from 'zod';
import { FractionLogicEnum } from '#common/enums/fraction/fraction-logic.enum';

export let zFractionSubTypeOption = z.object({
  logicGroup: z.enum(FractionLogicEnum).nullish(),
  typeValue: z.string().nullish(),
  value: z.string().nullish(),
  label: z.string().nullish()
});
