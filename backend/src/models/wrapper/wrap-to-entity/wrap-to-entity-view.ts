import { api } from '../../../barrels/api';
import { entities } from '../../../barrels/entities';
import { helper } from '../../../barrels/helper';

export function wrapToEntityView(view: api.View): entities.ViewEntity {
  return {
    view_id: helper.undefinedToNull(view.view_id),
    project_id: helper.undefinedToNull(view.project_id),
    repo_id: helper.undefinedToNull(view.repo_id),
    struct_id: helper.undefinedToNull(view.struct_id),
    is_pdt: helper.booleanToBenum(view.is_pdt),
    view_deps: view.view_deps
      ? JSON.stringify(view.view_deps)
      : JSON.stringify([]),
    server_ts: view.server_ts ? view.server_ts.toString() : null
  };
}
