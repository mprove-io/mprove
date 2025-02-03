import { FilterBricksDictionary } from '../filter-bricks-dictionary';
import { ProjectConnection } from '../project-connection';
import { FieldAny } from './field-any';
import { FileBasic } from './file-basic';
import { FileStoreControl } from './file-store-control';

export interface FileStore extends FileBasic {
  store?: string;
  store_line_num?: number;

  label?: string;
  label_line_num?: number;

  description?: string;
  description_line_num?: number;

  access_users?: string[];
  access_users_line_num?: number;

  access_roles?: string[];
  access_roles_line_num?: number;

  method?: string;
  method_line_num?: number;

  url_path?: string;
  url_path_line_num?: number;

  body?: string;
  body_line_num?: number;

  response?: string;
  response_line_num?: number;

  parameters?: FieldAny[];
  parameters_line_num?: number;

  results?: {
    result: string;
    result_line_num: number;

    fraction_types?: {
      type: string;
      type_line_num: number;

      name: string;
      name_line_num: number;

      or: string;
      or_line_num: number;

      and_not: string;
      and_not_line_num: number;

      meta: any;
      meta_line_num: any;

      controls: FileStoreControl[];
      controls_line_num: any;
    }[];
    fraction_types_line_num: number;
  }[];
  results_line_num?: number;

  build_metrics?: {
    time_label: string;
    time_label_line_num: number;

    details?: {
      unit: string;
      unit_line_num: number;

      dimension: string;
      dimension_line_num: number;
    }[];
    details_line_num: number;
  }[];
  build_metrics_line_num?: number;

  field_groups?: {
    group: string;
    group_line_num: number;

    label: string;
    label_line_num: number;

    show_if: string; // boolean
    show_if_line_num: number;
  }[];
  field_groups_line_num?: number;

  fields?: FieldAny[];
  fields_line_num?: number;

  //

  connection?: ProjectConnection;

  // only for types
  fieldsDeps?: {
    [fieldName: string]: {
      [depName: string]: number;
    };
  };

  // only for types
  fieldsDepsAfterSingles?: {
    [fieldName: string]: {
      [depName: string]: number;
    };
  };

  filters?: FilterBricksDictionary; // only for types
}
