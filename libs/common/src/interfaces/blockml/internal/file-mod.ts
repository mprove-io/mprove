import { Model as MalloyModel } from '@malloydata/malloy';
import { ModelEntryValueWithSource } from '@malloydata/malloy-interfaces';
import { ProjectConnection } from '../project-connection';
import { FileBasic } from './file-basic';

export interface FileMod extends FileBasic {
  mod?: string;
  mod_line_num?: number;

  label?: string;
  label_line_num?: number;

  // description?: string;
  // description_line_num?: number;

  source?: string;
  source_line_num?: number;

  location?: string;
  location_line_num?: number;

  connection?: ProjectConnection;

  access_roles?: string[];
  access_roles_line_num?: number;

  //

  malloyModel?: MalloyModel;

  valueWithSourceInfo?: ModelEntryValueWithSource;

  // malloyEntryValueWithSource?: ModelEntryValueWithSource;
}
