import { FileStoreFractionType } from './file-store-fraction-type';

export interface FileStoreResult {
  result?: string;
  result_line_num?: number;

  fraction_types?: FileStoreFractionType[];
  fraction_types_line_num?: number;
}
