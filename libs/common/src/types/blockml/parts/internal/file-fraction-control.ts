import { z } from 'zod';
import { ControlClassEnum } from '#common/enums/control-class.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type FileFractionControl = {
  input?: string;
  input_line_num?: number;
  list_input?: string;
  list_input_line_num?: number;
  switch?: string;
  switch_line_num?: number;
  date_picker?: string;
  date_picker_line_num?: number;
  selector?: string;
  selector_line_num?: number;
  value?: string;
  value_line_num?: number;
  name?: string;
  name_line_num?: number;
  controlClass?: EnumValues<typeof ControlClassEnum>;
};

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

assertTypesEqual<FileFractionControl, z.infer<typeof zFileFractionControl>>({
  value: true
});
