import { z } from 'zod';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Fraction, zFraction } from '#common/types/blockml/parts/fraction';
import type { EnumValues } from '#common/types/enum-values';

export type DashboardField = {
  id: string;
  hidden: boolean;
  maxFractions?: number;
  label: string;
  result?: EnumValues<typeof FieldResultEnum>;
  storeModel?: string;
  storeResult?: string;
  storeFilter?: string;
  suggestModelDimension?: string;
  fractions: Fraction[];
  description?: string;
};

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

assertTypesEqual<DashboardField, z.infer<typeof zDashboardField>>({
  value: true
});
