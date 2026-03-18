import { FileBasic } from './file-basic';
import { FileSchemaTable } from './file-schema-table';

export interface FileSchema extends FileBasic {
  schema?: string;
  schema_line_num?: number;

  description?: string;
  description_line_num?: number;

  tables?: FileSchemaTable[];
  tables_line_num?: number;
}
