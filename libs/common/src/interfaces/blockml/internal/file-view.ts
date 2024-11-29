import { FilterBricksDictionary } from '../filter-bricks-dictionary';
import { ProjectConnection } from '../project-connection';
import { FieldAny } from './field-any';
import { FileBasic } from './file-basic';
import { FileViewPart } from './file-view-part';

export interface FileView extends FileBasic {
  view?: string;
  view_line_num?: number;

  label?: string;
  label_line_num?: number;

  description?: string;
  description_line_num?: number;

  access_users?: string[];
  access_users_line_num?: number;

  access_roles?: string[];
  access_roles_line_num?: number;

  table?: string;
  table_line_num?: number;

  derived_table?: string;
  derived_table_line_num?: number;

  udfs?: string[];
  udfs_line_num?: number;

  parameters?: FieldAny[];
  parameters_line_num?: number;

  fields?: FieldAny[];
  fields_line_num?: number;

  //

  connection?: ProjectConnection;

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
    [viewPartName: string]: FileViewPart;
  };
}
