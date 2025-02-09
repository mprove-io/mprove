import { FileStoreDetail } from './file-store-detail';

export interface FileStoreBuildMetric {
  time_name?: string;
  time_name_line_num?: number;

  time_label?: string;
  time_label_line_num?: number;

  details?: FileStoreDetail[];
  details_line_num?: number;
}
