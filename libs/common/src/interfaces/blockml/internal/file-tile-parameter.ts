import { FileFraction } from './file-fraction';

export interface FileTileParameter {
  apply_to?: string;
  apply_to_line_num?: number;

  listen?: string;
  listen_line_num?: number;

  conditions?: string[];
  conditions_line_num?: number;

  fractions?: FileFraction[];
  fractions_line_num?: number;
}
