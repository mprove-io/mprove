import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function wrapViews(item: { views: interfaces.View[] }) {
  let { views } = item;

  let apiViews: api.View[] = views.map(x => {
    let view: api.View = {
      viewId: x.name,
      viewDeps: x.viewDeps
    };
    return view;
  });

  return apiViews;
}
