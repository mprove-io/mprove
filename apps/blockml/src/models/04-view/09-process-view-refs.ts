import { ConfigService } from '@nestjs/config';
import { barSpecial } from '~blockml/barrels/bar-special';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.ProcessViewRefs;

export function processViewRefs(
  item: {
    views: interfaces.View[];
    udfsDict: common.UdfsDict;
    weekStart: common.ProjectWeekStartEnum;
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

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

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Views, item.views);
  helper.log(
    cs,
    caller,
    func,
    structId,
    enums.LogTypeEnum.UdfsDict,
    item.udfsDict
  );

  return item.views;
}

function substituteViewRefsRecursive(item: {
  topView: interfaces.View;
  view: interfaces.View;
  partDeps: interfaces.ViewPart['deps'];
  views: interfaces.View[];
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

    let viewPart: interfaces.ViewPart = {
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
