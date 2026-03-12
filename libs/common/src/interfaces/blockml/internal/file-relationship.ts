import { FileRelationshipReference } from './file-relationship-reference';

export interface FileRelationship {
  schema?: string;
  schema_line_num?: number;

  references?: FileRelationshipReference[];
  references_line_num?: number;
}
