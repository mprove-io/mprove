import { api } from '~/barrels/api';
import { FieldAny } from '~/interfaces/field/field-any';
import { FileBasic } from '~/interfaces/file/file-basic';
import { FilterBricksDictionary } from '~/interfaces/filter-bricks-dictionary';
import { ViewPart } from '~/interfaces/view-part';

export interface View extends FileBasic {
  view?: string;
  view_line_num?: number;

  label?: string;
  label_line_num?: number;

  description?: string;
  description_line_num?: number;

  access_users?: string[];
  access_users_line_num?: number;

  table?: string;
  table_line_num?: number;

  derived_table?: string;
  derived_table_line_num?: number;

  udfs?: string[];
  udfs_line_num?: number;

  fields?: FieldAny[];
  fields_line_num?: number;

  //

  connection?: api.ProjectConnection;

  fieldsDeps?: {
    [fieldName: string]: {
      [depName: string]: number;
    };
  };

  fieldsDepsAfterSingles?: {
    [fieldName: string]: {
      [depName: string]: number;
    };
  };

  asDeps?: {
    // derived table deps
    [as: string]: {
      viewName: string;
      fieldNames: { [fieldName: string]: number };
    };
  };

  viewDeps?: string[]; // for web deps graph

  filters?: FilterBricksDictionary;

  derivedTableStart?: string[];

  parts?: {
    [viewPartName: string]: ViewPart;
  };
}
