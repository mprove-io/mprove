import { FileStoreFractionControl } from './file-store-fraction-control';

export interface FileStoreFractionType {
  type?: string;
  type_line_num?: number;

  label?: string;
  label_line_num?: number;

  or?: string;
  or_line_num?: number;

  and_not?: string;
  and_not_line_num?: number;

  meta?: any;
  meta_line_num?: any;

  controls?: FileStoreFractionControl[];
  controls_line_num?: any;
}
