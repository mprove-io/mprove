import type { FileStoreFractionType } from '#common/types/blockml/parts/internal/file-store-fraction-type';

export type FileStoreResult = {
  result?: string;
  result_line_num?: number;
  fraction_types?: FileStoreFractionType[];
  fraction_types_line_num?: number;
};
