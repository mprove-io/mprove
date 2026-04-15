import { z } from 'zod';
import { ControlClassEnum } from '#common/enums/control-class.enum';
import { zFileStoreFractionControlOption } from '#common/zod/blockml/internal/file-store-fraction-control-option';

export let zFileStoreFractionControl = z
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
    options: z.array(zFileStoreFractionControlOption).nullish(),
    options_line_num: z.number().nullish(),
    value: z.string().nullish(),
    value_line_num: z.number().nullish(),
    label: z.string().nullish(),
    label_line_num: z.number().nullish(),
    required: z.string().nullish(),
    required_line_num: z.number().nullish(),
    name: z.string().nullish(),
    name_line_num: z.number().nullish(),
    controlClass: z.enum(ControlClassEnum).nullish(),
    isMetricsDate: z.boolean().nullish()
  })
  .meta({ id: 'FileStoreFractionControl' });

export type FileStoreFractionControl = z.infer<
  typeof zFileStoreFractionControl
>;
