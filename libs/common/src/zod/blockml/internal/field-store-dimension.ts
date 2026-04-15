import { z } from 'zod';
import { DetailUnitEnum } from '#common/enums/detail-unit.enum';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';

export let zFieldStoreDimension = z
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
    time_group: z.string().nullish(),
    time_group_line_num: z.number().nullish(),
    detail: z.enum(DetailUnitEnum).nullish(),
    detail_line_num: z.number().nullish(),
    required: z.string().nullish(),
    required_line_num: z.number().nullish(),
    meta: z.any().nullish(),
    meta_line_num: z.number().nullish(),
    name: z.string().nullish(),
    name_line_num: z.number().nullish(),
    fieldClass: z.enum(FieldClassEnum).nullish()
  })
  .meta({ id: 'FieldStoreDimension' });

export type FieldStoreDimension = z.infer<typeof zFieldStoreDimension>;
