import { z } from 'zod';
import { FieldClassEnum } from '#common/enums/field-class.enum';

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

export type FieldTime = z.infer<typeof zFieldTime>;
