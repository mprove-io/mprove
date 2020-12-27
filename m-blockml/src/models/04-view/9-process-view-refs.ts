import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { barSpecial } from '../../barrels/bar-special';
import { interfaces } from '../../barrels/interfaces';
import { BmError } from '../bm-error';

let func = enums.FuncEnum.ProcessViewRefs;

export function processViewRefs(item: {
  views: interfaces.View[];
  udfsDict: api.UdfsDict;
  weekStart: api.ProjectWeekStartEnum;
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  item.views
    .filter(x => helper.isDefined(x.derived_table))
    .forEach(x => {
      let input = x.derived_table;
      input = api.MyRegex.replaceViewRefs(input, x.name);
      input = api.MyRegex.removeBracketsOnViewFieldRefs(input);

      x.derivedTableStart = input.split('\n');
    });

  item.views
    .filter(x => helper.isDefined(x.derived_table))
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

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Views, item.views);
  helper.log(caller, func, structId, enums.LogTypeEnum.UdfsDict, item.udfsDict);

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
