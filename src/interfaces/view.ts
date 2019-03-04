import { TopBasic } from './top-basic';
import { FieldExt } from './field-ext';

export interface View extends TopBasic {
  view: string;
  view_line_num: number;

  label: string;
  label_line_num: number;

  description: string;
  description_line_num: number;

  access_users: string[];
  access_users_line_num: number;

  table: string;
  table_line_num: number;

  derived_table: string;
  derived_table_line_num: number;

  derived_table_start: string;
  derived_table_new: string;

  parts: {
    [viewPartName: string]: {
      content: string,
      content_prepared: string,
      parent_view_name: string,
      deps: { [depName: string]: number }
    }
  };


  permanent: string; // boolean
  permanent_line_num: number;

  udfs: string[];
  udfs_line_num: number;


  fields: FieldExt[];
  fields_line_num: number;


  fields_deps: {
    [field: string]: {
      [dep: string]: number
    };
  };

  fields_deps_after_singles: {
    [field: string]: {
      [dep: string]: number
    };
  };

  as_deps: {
    [as: string]: {
      view_name: string,
      fields: { [field: string]: number }
    };
  };

  pdt_view_deps: {
    [view: string]: number
  };

  pdt_view_deps_all: {
    [view: string]: number
  };
}

