import { z } from 'zod';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type FieldTime = {
  hidden?: string;
  hidden_line_num?: number;
  group_label?: string;
  group_label_line_num?: number;
  group_description?: string;
  group_description_line_num?: number;
  name?: string;
  name_line_num?: number;
  fieldClass?: EnumValues<typeof FieldClassEnum>;
};

export let zFieldTime = z
  .object({
    hidden: z.string().nullish(),
    hidden_line_num: z.number().nullish(),
    group_label: z.string().nullish(),
    group_label_line_num: z.number().nullish(),
    group_description: z.string().nullish(),
    group_description_line_num: z.number().nullish(),
    name: z.string().nullish(),
    name_line_num: z.number().nullish(),
    fieldClass: z.enum(FieldClassEnum).nullish()
  })
  .meta({ id: 'FieldTime' });

assertTypesEqual<FieldTime, z.infer<typeof zFieldTime>>({ value: true });
