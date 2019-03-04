import { AmError } from '../../barrels/am-error';
import { api } from '../../barrels/api';

export function wrapErrors(item: {
  projectId: string;
  repoId: string;
  structId: string;
  errors: AmError[];
}): api.SwError[] {
  let wrappedErrors: api.SwError[] = item.errors.map(e => {
    return {
      project_id: item.projectId,
      repo_id: item.repoId,
      struct_id: item.structId,
      error_id: e.id,
      type: e.title,
      message: e.message,
      lines: e.lines.map(eLine => ({
        line_number: eLine.line,
        file_name: eLine.name,
        file_id: eLine.path
      })),
      deleted: false,
      server_ts: 1
    };
  });

  return wrappedErrors;
}
