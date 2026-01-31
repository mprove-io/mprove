export type GitFileStatusType =
  | 'not_added'
  | 'created'
  | 'deleted'
  | 'modified'
  | 'renamed'
  | 'conflicted';

export interface FileWithStatusType {
  path: string;
  type: GitFileStatusType;
}
