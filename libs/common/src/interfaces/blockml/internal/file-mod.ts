import { Model as MalloyModel } from '@malloydata/malloy';
import { ModelEntryValueWithSource } from '@malloydata/malloy-interfaces';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { FileBasic } from './file-basic';

export interface FileMod extends FileBasic {
  source?: string;

  label?: string;

  location?: string;

  blockmlPath?: string;

  access_roles?: string[];

  connectionId?: string;

  connectionType?: ConnectionTypeEnum;

  malloyModel?: MalloyModel;

  valueWithSourceInfo?: ModelEntryValueWithSource;

  // malloyEntryValueWithSource?: ModelEntryValueWithSource;
}
