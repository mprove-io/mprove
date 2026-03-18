import { FileSchemaColumn } from './file-schema-column';

export interface FileSchemaTable {
  table?: string;
  table_line_num?: number;

  description?: string;
  description_line_num?: number;

  columns?: FileSchemaColumn[];
  columns_line_num?: number;
}
