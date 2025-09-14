import { Model as MalloyModel } from '@malloydata/malloy';
import { ModelEntryValueWithSource } from '@malloydata/malloy-interfaces';
import { ProjectConnection } from '~common/interfaces/backend/project-connection';
import { FileBasic } from './file-basic';

export interface FileMod extends FileBasic {
  source?: string;

  label?: string;

  location?: string;

  blockmlPath?: string;

  access_roles?: string[];

  connection?: ProjectConnection;

  malloyModel?: MalloyModel;

  valueWithSourceInfo?: ModelEntryValueWithSource;

  // malloyEntryValueWithSource?: ModelEntryValueWithSource;
}
