import { z } from 'zod';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { zFraction } from '#common/zod/blockml/fraction';
import { zFileFraction } from '#common/zod/blockml/internal/file-fraction';

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

export type FieldFilter = z.infer<typeof zFieldFilter>;
