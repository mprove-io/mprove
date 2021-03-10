import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';

export function wrapViews(item: { views: interfaces.View[] }) {
  let { views } = item;

  let apiViews: common.View[] = views.map(x => {
    let view: common.View = {
      viewId: x.name,
      filePath: x.filePath,
      viewDeps: x.viewDeps
    };
    return view;
  });

  return apiViews;
}
