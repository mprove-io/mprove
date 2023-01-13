import { FileBasic } from '~blockml/interfaces/file/file-basic';

export interface Api extends FileBasic {
  api?: string;
  api_line_num?: number;

  label?: string;
  label_line_num?: number;

  https?: string; // boolean
  https_line_num?: number;

  host?: string;
  host_line_num?: number;

  headers?: any[];
  headers_line_num?: number;

  steps?: any[];
  steps_line_num?: number;
}
