import { common } from '~blockml/barrels/common';

export function wrapViews(item: { views: common.FileView[] }) {
  let { views } = item;

  let apiViews: common.FileView[] = views.map(x => {
    let view: common.FileView = {
      viewId: x.name,
      filePath: x.filePath,
      viewDeps: x.viewDeps
    };
    return view;
  });

  return apiViews;
}
