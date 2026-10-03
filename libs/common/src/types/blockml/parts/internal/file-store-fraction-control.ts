import { z } from 'zod';
import { ControlClassEnum } from '#common/enums/control-class.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FileStoreFractionControlOption,
  zFileStoreFractionControlOption
} from '#common/types/blockml/parts/internal/file-store-fraction-control-option';
import type { EnumValues } from '#common/types/enum-values';

export type FileStoreFractionControl = {
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
  options?: FileStoreFractionControlOption[];
  options_line_num?: number;
  value?: string;
  value_line_num?: number;
  label?: string;
  label_line_num?: number;
  required?: string;
  required_line_num?: number;
  name?: string;
  name_line_num?: number;
  controlClass?: EnumValues<typeof ControlClassEnum>;
  isMetricsDate?: boolean;
};

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

assertTypesEqual<
  FileStoreFractionControl,
  z.infer<typeof zFileStoreFractionControl>
>({ value: true });
