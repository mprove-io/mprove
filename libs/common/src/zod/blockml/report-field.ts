import { z } from 'zod';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { zFraction } from '#common/zod/blockml/fraction';

export let zReportField = z
  .object({
    id: z.string(),
    hidden: z.boolean(),
    label: z.string(),
    description: z.string().nullish(),
    fractions: z.array(zFraction),
    maxFractions: z.number().nullish(),
    result: z.enum(FieldResultEnum).nullish(),
    suggestModelDimension: z.string().nullish(),
    storeModel: z.string().nullish(),
    storeResult: z.string().nullish(),
    storeFilter: z.string().nullish()
  })
  .meta({ id: 'ReportField' });

export type ReportField = z.infer<typeof zReportField>;
