import { FileBasic } from './file-basic';

export interface FileStore extends FileBasic {
  store?: string;
  store_line_num?: number;

  label?: string;
  label_line_num?: number;
}
