import { z } from 'zod';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type FieldDimension = {
  hidden?: string;
  hidden_line_num?: number;
  label?: string;
  label_line_num?: number;
  description?: string;
  description_line_num?: number;
  sql?: string;
  sql_line_num?: number;
  result?: EnumValues<typeof FieldResultEnum>;
  result_line_num?: number;
  suggest_model_dimension?: string;
  suggest_model_dimension_line_num?: number;
  unnest?: string;
  unnest_line_num?: number;
  format_number?: string;
  format_number_line_num?: number;
  currency_prefix?: string;
  currency_prefix_line_num?: number;
  currency_suffix?: string;
  currency_suffix_line_num?: number;
  group_label?: string;
  group_label_line_num?: number;
  group_description?: string;
  group_description_line_num?: number;
  groupId?: string;
  name?: string;
  name_line_num?: number;
  fieldClass?: EnumValues<typeof FieldClassEnum>;
  sqlReal?: string;
  sqlTimestampReal?: string;
  sqlTimestampName?: string;
  sqlTimestamp?: string;
};

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

assertTypesEqual<FieldDimension, z.infer<typeof zFieldDimension>>({
  value: true
});
