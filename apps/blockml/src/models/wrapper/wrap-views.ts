import { common } from '~blockml/barrels/common';

export function wrapViews(item: { views: common.FileView[] }) {
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
