import type { FileBasic } from '#common/types/blockml/parts/internal/file/file-basic';
import type { FileSchemaTable } from '#common/types/blockml/parts/internal/file-schema-table';
import type { Extend } from '#common/types/extend';

export type FileSchema = Extend<
  FileBasic,
  {
    schema?: string;
    schema_line_num?: number;
    description?: string;
    description_line_num?: number;
    tables?: FileSchemaTable[];
    tables_line_num?: number;
  }
>;
