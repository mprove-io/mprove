import { api } from '../../../barrels/api';
import { entities } from '../../../barrels/entities';
import { helper } from '../../../barrels/helper';

export function wrapToApiView(view: entities.ViewEntity): api.View {
  return {
    view_id: view.view_id,
    project_id: view.project_id,
    repo_id: view.repo_id,
    struct_id: view.struct_id,
    is_pdt: helper.benumToBoolean(view.is_pdt),
    view_deps: JSON.parse(view.view_deps),
    server_ts: Number(view.server_ts)
  };
}
