import { z } from 'zod';
import { FractionLogicEnum } from '#common/enums/fraction/fraction-logic.enum';

export let zFractionSubTypeOption = z
  .object({
    logicGroup: z.enum(FractionLogicEnum).nullish(),
    typeValue: z.string(),
    value: z.string(),
    label: z.string().nullish()
  })
  .meta({ id: 'FractionSubTypeOption' });

export type FractionSubTypeOption = z.infer<typeof zFractionSubTypeOption>;
