import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function wrapViews(item: {
  projectId: string;
  repoId: string;
  structId: string;
  views: interfaces.View[];
}): api.ViewsPack {
  let viewsPackViews: api.ViewsPackView[] = item.views.map(x => {
    let view: api.ViewsPackView = {
      viewId: x.name,
      viewDeps: x.viewDeps
    };
    return view;
  });

  let viewsPack: api.ViewsPack = {
    projectId: item.projectId,
    repoId: item.repoId,
    structId: item.structId,
    views: viewsPackViews,
    serverTs: 1
  };

  return viewsPack;
}
