import { api } from '../../../barrels/api';
import { entities } from '../../../barrels/entities';

export function wrapToApiError(error: entities.ErrorEntity): api.SwError {
  return {
    error_id: error.error_id,
    project_id: error.project_id,
    repo_id: error.repo_id,
    struct_id: error.struct_id,
    type: error.type,
    message: error.message,
    lines: JSON.parse(error.lines),
    server_ts: Number(error.server_ts)
  };
}
