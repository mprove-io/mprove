import { FileSchemaRelationship } from './file-schema-relationship';

export interface FileSchemaColumn {
  column?: string;
  column_line_num?: number;

  example?: string;
  example_line_num?: number;

  description?: string;
  description_line_num?: number;

  relationships?: FileSchemaRelationship[];
  relationships_line_num?: number;
}
