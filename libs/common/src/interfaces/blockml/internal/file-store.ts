import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { FieldAny } from './field-any';
import { FileBasic } from './file-basic';
import { FileStoreBuildMetric } from './file-store-build-metric';
import { FileStoreFieldGroup } from './file-store-field-group';
import { FileStoreFieldTimeGroup } from './file-store-field-time-group';
import { FileStoreResult } from './file-store-result';

export interface FileStore extends FileBasic {
  store?: string;
  store_line_num?: number;

  preset?: string;
  preset_line_num?: number;

  label?: string;
  label_line_num?: number;

  access_roles?: string[];
  access_roles_line_num?: number;

  method?: string;
  method_line_num?: number;

  request?: string;
  request_line_num?: number;

  response?: string;
  response_line_num?: number;

  date_range_includes_right_side?: string;
  date_range_includes_right_side_line_num?: number;

  parameters?: FieldAny[];
  parameters_line_num?: number;

  results?: FileStoreResult[];
  results_line_num?: number;

  build_metrics?: FileStoreBuildMetric[];
  build_metrics_line_num?: number;

  field_groups?: FileStoreFieldGroup[];
  field_groups_line_num?: number;

  field_time_groups?: FileStoreFieldTimeGroup[];
  field_time_groups_line_num?: number;

  fields?: FieldAny[];
  fields_line_num?: number;

  //

  connectionId?: string;

  connectionType?: ConnectionTypeEnum;

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

  // filters?: FilterBricksDictionary; // only for types
}
