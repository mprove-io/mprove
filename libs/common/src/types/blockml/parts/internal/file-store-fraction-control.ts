import type { ControlClass } from '#common/types/blockml/parts/fraction/control-class';

import type { FileStoreFractionControlOption } from '#common/types/blockml/parts/internal/file-store-fraction-control-option';

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
  controlClass?: ControlClass;
  isMetricsDate?: boolean;
};
