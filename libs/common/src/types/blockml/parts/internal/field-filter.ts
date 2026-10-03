import { z } from 'zod';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Fraction, zFraction } from '#common/types/blockml/parts/fraction';
import {
  type FileFraction,
  zFileFraction
} from '#common/types/blockml/parts/internal/file-fraction';
import type { EnumValues } from '#common/types/enum-values';

export type FieldFilter = {
  hidden?: string;
  hidden_line_num?: number;
  label?: string;
  label_line_num?: number;
  description?: string;
  description_line_num?: number;
  result?: EnumValues<typeof FieldResultEnum>;
  result_line_num?: number;
  store_model?: string;
  store_model_line_num?: number;
  store_result?: string;
  store_result_line_num?: number;
  store_filter?: string;
  store_filter_line_num?: number;
  suggest_model_dimension?: string;
  suggest_model_dimension_line_num?: number;
  conditions?: string[];
  conditions_line_num?: number;
  fractions?: FileFraction[];
  fractions_line_num?: number;
  apiFractions?: Fraction[];
  filter?: string;
  name?: string;
  name_line_num?: number;
  fieldClass?: EnumValues<typeof FieldClassEnum>;
};

export let zFieldFilter = z
  .object({
    hidden: z.string().nullish(),
    hidden_line_num: z.number().nullish(),
    label: z.string().nullish(),
    label_line_num: z.number().nullish(),
    description: z.string().nullish(),
    description_line_num: z.number().nullish(),
    result: z.enum(FieldResultEnum).nullish(),
    result_line_num: z.number().nullish(),
    store_model: z.string().nullish(),
    store_model_line_num: z.number().nullish(),
    store_result: z.string().nullish(),
    store_result_line_num: z.number().nullish(),
    store_filter: z.string().nullish(),
    store_filter_line_num: z.number().nullish(),
    suggest_model_dimension: z.string().nullish(),
    suggest_model_dimension_line_num: z.number().nullish(),
    conditions: z.array(z.string()).nullish(),
    conditions_line_num: z.number().nullish(),
    fractions: z.array(zFileFraction).nullish(),
    fractions_line_num: z.number().nullish(),
    apiFractions: z.array(zFraction).nullish(),
    filter: z.string().nullish(),
    name: z.string().nullish(),
    name_line_num: z.number().nullish(),
    fieldClass: z.enum(FieldClassEnum).nullish()
  })
  .meta({ id: 'FieldFilter' });

assertTypesEqual<FieldFilter, z.infer<typeof zFieldFilter>>({ value: true });
