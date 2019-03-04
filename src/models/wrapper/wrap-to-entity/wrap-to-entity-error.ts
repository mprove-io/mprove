import { api } from '../../../barrels/api';
import { entities } from '../../../barrels/entities';
import { helper } from '../../../barrels/helper';

export function wrapToEntityError(error: api.SwError): entities.ErrorEntity {

  return {
    error_id: helper.undefinedToNull(error.error_id),
    project_id: helper.undefinedToNull(error.project_id),
    repo_id: helper.undefinedToNull(error.repo_id),
    struct_id: helper.undefinedToNull(error.struct_id),
    type: helper.undefinedToNull(error.type),
    message: helper.undefinedToNull(error.message),
    lines: error.lines ? JSON.stringify(error.lines) : null,
    server_ts: error.server_ts ? error.server_ts.toString() : null,
  };
}
