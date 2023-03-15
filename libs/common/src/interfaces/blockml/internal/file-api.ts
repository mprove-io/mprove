import { FileBasic } from './file-basic';

export interface FileApi extends FileBasic {
  api?: string;
  api_line_num?: number;

  label?: string;
  label_line_num?: number;

  steps?: any[];
  steps_line_num?: number;
}
