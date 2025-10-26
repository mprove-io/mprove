import { FieldAny } from './field-any';
import { FileBasic } from './file-basic';
import { FilePartTile } from './file-part-tile';

export interface FileDashboard extends FileBasic {
  dashboard?: string;
  dashboard_line_num?: number;

  hidden?: string; // boolean
  hidden_line_num?: number;

  title?: string;
  title_line_num?: number;

  group?: string;
  group_line_num?: number;

  access_roles?: string[];
  access_roles_line_num?: number;

  parameters?: FieldAny[];
  parameters_line_num?: number;

  fields?: FieldAny[];
  fields_line_num?: number;

  tiles?: FilePartTile[];
  tiles_line_num?: number;

  //
}
