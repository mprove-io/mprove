import { z } from 'zod';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Fraction, zFraction } from '#common/types/blockml/parts/fraction';
import type { EnumValues } from '#common/types/enum-values';

export type ReportField = {
  id: string;
  hidden: boolean;
  label: string;
  description?: string;
  fractions: Fraction[];
  maxFractions?: number;
  result?: EnumValues<typeof FieldResultEnum>;
  suggestModelDimension?: string;
  storeModel?: string;
  storeResult?: string;
  storeFilter?: string;
};

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

assertTypesEqual<ReportField, z.infer<typeof zReportField>>({ value: true });
