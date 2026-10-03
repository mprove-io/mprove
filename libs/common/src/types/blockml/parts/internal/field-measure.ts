import { z } from 'zod';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { FieldTypeEnum } from '#common/enums/field-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type FieldMeasure = {
  hidden?: string;
  hidden_line_num?: number;
  label?: string;
  label_line_num?: number;
  description?: string;
  description_line_num?: number;
  sql?: string;
  sql_line_num?: number;
  type?: EnumValues<typeof FieldTypeEnum>;
  type_line_num?: number;
  result?: EnumValues<typeof FieldResultEnum>;
  result_line_num?: number;
  format_number?: string;
  format_number_line_num?: number;
  currency_prefix?: string;
  currency_prefix_line_num?: number;
  currency_suffix?: string;
  currency_suffix_line_num?: number;
  sql_key?: string;
  sql_key_line_num?: number;
  percentile?: string;
  percentile_line_num?: number;
  name?: string;
  name_line_num?: number;
  fieldClass?: EnumValues<typeof FieldClassEnum>;
  sqlReal?: string;
  sqlKeyReal?: string;
};

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

assertTypesEqual<FieldMeasure, z.infer<typeof zFieldMeasure>>({ value: true });
