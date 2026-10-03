import { z } from 'zod';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type FieldStoreMeasure = {
  label?: string;
  label_line_num?: number;
  description?: string;
  description_line_num?: number;
  result?: EnumValues<typeof FieldResultEnum>;
  result_line_num?: number;
  format_number?: string;
  format_number_line_num?: number;
  currency_prefix?: string;
  currency_prefix_line_num?: number;
  currency_suffix?: string;
  currency_suffix_line_num?: number;
  group?: string;
  group_line_num?: number;
  required?: string;
  required_line_num?: number;
  meta?: any;
  meta_line_num?: number;
  name?: string;
  name_line_num?: number;
  fieldClass?: EnumValues<typeof FieldClassEnum>;
};

export let zFieldStoreMeasure = z
  .object({
    label: z.string().nullish(),
    label_line_num: z.number().nullish(),
    description: z.string().nullish(),
    description_line_num: z.number().nullish(),
    result: z.enum(FieldResultEnum).nullish(),
    result_line_num: z.number().nullish(),
    format_number: z.string().nullish(),
    format_number_line_num: z.number().nullish(),
    currency_prefix: z.string().nullish(),
    currency_prefix_line_num: z.number().nullish(),
    currency_suffix: z.string().nullish(),
    currency_suffix_line_num: z.number().nullish(),
    group: z.string().nullish(),
    group_line_num: z.number().nullish(),
    required: z.string().nullish(),
    required_line_num: z.number().nullish(),
    meta: z.any().nullish(),
    meta_line_num: z.number().nullish(),
    name: z.string().nullish(),
    name_line_num: z.number().nullish(),
    fieldClass: z.enum(FieldClassEnum).nullish()
  })
  .meta({ id: 'FieldStoreMeasure' });

assertTypesEqual<FieldStoreMeasure, z.infer<typeof zFieldStoreMeasure>>({
  value: true
});
