import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FieldResult,
  zFieldResult
} from '#common/types/blockml/parts/field/field-result';
import {
  type Fraction,
  zFraction
} from '#common/types/blockml/parts/fraction/fraction';

export type ReportField = {
  id: string;
  hidden: boolean;
  label: string;
  description?: string;
  fractions: Fraction[];
  maxFractions?: number;
  result?: FieldResult;
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
    result: zFieldResult.nullish(),
    suggestModelDimension: z.string().nullish(),
    storeModel: z.string().nullish(),
    storeResult: z.string().nullish(),
    storeFilter: z.string().nullish()
  })
  .meta({ id: 'ReportField' });

assertTypesEqual<ReportField, z.infer<typeof zReportField>>({ value: true });
