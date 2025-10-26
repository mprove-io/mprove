import { FileBasic } from './file-basic';
import { FilePartTile } from './file-part-tile';

export interface FileChart extends FileBasic {
  chart?: string;
  chart_line_num?: number;

  hidden?: string; // boolean
  hidden_line_num?: number;

  group?: string;
  group_line_num?: number;

  tiles?: FilePartTile[];
  tiles_line_num?: number;
}
