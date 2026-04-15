import { z } from 'zod';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { FieldTypeEnum } from '#common/enums/field-type.enum';

export let zFieldMeasure = z
  .object({
    hidden: z.string().nullish(),
    hidden_line_num: z.number().nullish(),
    label: z.string().nullish(),
    label_line_num: z.number().nullish(),
    description: z.string().nullish(),
    description_line_num: z.number().nullish(),
    sql: z.string().nullish(),
    sql_line_num: z.number().nullish(),
    type: z.enum(FieldTypeEnum).nullish(),
    type_line_num: z.number().nullish(),
    result: z.enum(FieldResultEnum).nullish(),
    result_line_num: z.number().nullish(),
    format_number: z.string().nullish(),
    format_number_line_num: z.number().nullish(),
    currency_prefix: z.string().nullish(),
    currency_prefix_line_num: z.number().nullish(),
    currency_suffix: z.string().nullish(),
    currency_suffix_line_num: z.number().nullish(),
    sql_key: z.string().nullish(),
    sql_key_line_num: z.number().nullish(),
    percentile: z.string().nullish(),
    percentile_line_num: z.number().nullish(),
    name: z.string().nullish(),
    name_line_num: z.number().nullish(),
    fieldClass: z.enum(FieldClassEnum).nullish(),
    sqlReal: z.string().nullish(),
    sqlKeyReal: z.string().nullish()
  })
  .meta({ id: 'FieldMeasure' });

export type FieldMeasure = z.infer<typeof zFieldMeasure>;
