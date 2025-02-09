import { enums } from '~common/barrels/enums';
import { FileStoreFractionControlOption } from './file-store-fraction-control-option';

export interface FileStoreFractionControl {
  input?: string;
  input_line_num?: number;

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

  is_array?: string; // boolean
  is_array_line_num?: number;

  show_if?: string;
  show_if_line_num?: number;

  required?: string; // boolean
  required_line_num?: number;

  //

  name?: string;
  name_line_num?: number;

  controlClass?: enums.ControlClassEnum;
}
