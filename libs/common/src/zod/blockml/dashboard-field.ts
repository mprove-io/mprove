import { z } from 'zod';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { zFraction } from '#common/zod/blockml/fraction';

export let zDashboardField = z
  .object({
    id: z.string(),
    hidden: z.boolean(),
    maxFractions: z.number().nullish(),
    label: z.string(),
    result: z.enum(FieldResultEnum).nullish(),
    storeModel: z.string().nullish(),
    storeResult: z.string().nullish(),
    storeFilter: z.string().nullish(),
    suggestModelDimension: z.string().nullish(),
    fractions: z.array(zFraction),
    description: z.string().nullish()
  })
  .meta({ id: 'DashboardField' });

export type DashboardField = z.infer<typeof zDashboardField>;
