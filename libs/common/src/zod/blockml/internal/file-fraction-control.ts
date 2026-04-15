import { z } from 'zod';
import { ControlClassEnum } from '#common/enums/control-class.enum';

export let zFileFractionControl = z
  .object({
    input: z.string().nullish(),
    input_line_num: z.number().nullish(),
    list_input: z.string().nullish(),
    list_input_line_num: z.number().nullish(),
    switch: z.string().nullish(),
    switch_line_num: z.number().nullish(),
    date_picker: z.string().nullish(),
    date_picker_line_num: z.number().nullish(),
    selector: z.string().nullish(),
    selector_line_num: z.number().nullish(),
    value: z.string().nullish(),
    value_line_num: z.number().nullish(),
    name: z.string().nullish(),
    name_line_num: z.number().nullish(),
    controlClass: z.enum(ControlClassEnum).nullish()
  })
  .meta({ id: 'FileFractionControl' });

export type FileFractionControl = z.infer<typeof zFileFractionControl>;
