import { z } from 'zod';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';

export let zFieldDimension = z
  .object({
    hidden: z.string().nullish(),
    hidden_line_num: z.number().nullish(),
    label: z.string().nullish(),
    label_line_num: z.number().nullish(),
    description: z.string().nullish(),
    description_line_num: z.number().nullish(),
    sql: z.string().nullish(),
    sql_line_num: z.number().nullish(),
    result: z.enum(FieldResultEnum).nullish(),
    result_line_num: z.number().nullish(),
    suggest_model_dimension: z.string().nullish(),
    suggest_model_dimension_line_num: z.number().nullish(),
    unnest: z.string().nullish(),
    unnest_line_num: z.number().nullish(),
    format_number: z.string().nullish(),
    format_number_line_num: z.number().nullish(),
    currency_prefix: z.string().nullish(),
    currency_prefix_line_num: z.number().nullish(),
    currency_suffix: z.string().nullish(),
    currency_suffix_line_num: z.number().nullish(),
    group_label: z.string().nullish(),
    group_label_line_num: z.number().nullish(),
    group_description: z.string().nullish(),
    group_description_line_num: z.number().nullish(),
    groupId: z.string().nullish(),
    name: z.string().nullish(),
    name_line_num: z.number().nullish(),
    fieldClass: z.enum(FieldClassEnum).nullish(),
    sqlReal: z.string().nullish(),
    sqlTimestampReal: z.string().nullish(),
    sqlTimestampName: z.string().nullish(),
    sqlTimestamp: z.string().nullish()
  })
  .meta({ id: 'FieldDimension' });

export type FieldDimension = z.infer<typeof zFieldDimension>;
