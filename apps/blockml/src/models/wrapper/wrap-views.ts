import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { interfaces } from '~blockml/barrels/interfaces';

export function wrapViews(item: { views: interfaces.View[] }) {
  let { views } = item;

  let apiViews: apiToBlockml.View[] = views.map(x => {
    let view: apiToBlockml.View = {
      viewId: x.name,
      viewDeps: x.viewDeps
    };
    return view;
  });

  return apiViews;
}
