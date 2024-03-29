import { FieldAny } from '~blockml/interfaces/field/field-any';
import { FileBasic } from '~blockml/interfaces/file/file-basic';
import { FilterBricksDictionary } from '~blockml/interfaces/filter-bricks-dictionary';
import { Report } from '~blockml/interfaces/report';

export interface Dashboard extends FileBasic {
  dashboard?: string;
  dashboard_line_num?: number;

  hidden?: string; // boolean
  hidden_line_num?: number;

  title?: string;
  title_line_num?: number;

  group?: string;
  group_line_num?: number;

  description?: string;
  description_line_num?: number;

  access_users?: string[];
  access_users_line_num?: number;

  access_roles?: string[];
  access_roles_line_num?: number;

  fields?: FieldAny[];
  fields_line_num?: number;

  reports?: Report[];
  reports_line_num?: number;

  //

  filters?: FilterBricksDictionary;
}
