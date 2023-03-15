import { ConfigService } from '@nestjs/config';
import { barSpecial } from '~blockml/barrels/bar-special';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.ProcessViewRefs;

export function processViewRefs(
  item: {
    views: common.FileView[];
    udfsDict: common.UdfsDict;
    weekStart: common.ProjectWeekStartEnum;
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  item.views
    .filter(x => common.isDefined(x.derived_table))
    .forEach(x => {
      x.parts = {};

      if (Object.keys(x.asDeps).length > 0) {
        substituteViewRefsRecursive({
          topView: x,
          view: x,
          partDeps: {},
          views: item.views
        });
      }
    });

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Views, item.views);
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.UdfsDict,
    item.udfsDict
  );

  return item.views;
}

function substituteViewRefsRecursive(item: {
  topView: common.FileView;
  view: common.FileView;
  partDeps: common.FileViewPart['deps'];
  views: common.FileView[];
}) {
  Object.keys(item.view.asDeps).forEach(as => {
    let depView = item.views.find(
      v => v.name === item.view.asDeps[as].viewName
    );

    let viewPartName = `${item.view.name}__${depView.name}__${as}`;

    let { sub, extraUdfs, varsSubSteps } = barSpecial.genSub({
      select: Object.keys(item.view.asDeps[as].fieldNames),
      view: depView,
      viewPartName: viewPartName
    });

    Object.keys(extraUdfs).forEach(udfName => {
      if (item.topView.udfs.indexOf(udfName) < 0) {
        item.topView.udfs.push(udfName);
      }
    });

    let viewPart: common.FileViewPart = {
      viewName: depView.name,
      deps: {},
      sub: sub,
      varsSubSteps: varsSubSteps
    };

    item.topView.parts[viewPartName] = viewPart;
    item.partDeps[viewPartName] = 1;

    if (Object.keys(depView.asDeps).length > 0) {
      substituteViewRefsRecursive({
        topView: item.topView,
        view: depView,
        partDeps: viewPart.deps,
        views: item.views
      });
    }
  });
  return;
}
