import { ApRegex } from '../../barrels/am-regex';
import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';
import { wrapField } from './wrap-field';

export function wrapViews(item: {
  projectId: string;
  repoId: string;
  structId: string;
  views: interfaces.View[];
}): api.View[] {
  let wrappedViews: api.View[] = [];

  item.views.forEach(x => {
    wrappedViews.push({
      project_id: item.projectId,
      repo_id: item.repoId,
      struct_id: item.structId,
      view_id: x.name,
      is_pdt: x.is_pdt,
      view_deps: x.view_deps,
      server_ts: 1
    });
  });

  return wrappedViews;
}
