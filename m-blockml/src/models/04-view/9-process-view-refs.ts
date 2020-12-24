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

  item.views.forEach(x => {
    if (helper.isUndefined(x.derived_table)) {
      return;
    }

    x.parts = {};

    let input = x.derived_table;

    if (Object.keys(x.asDeps).length > 0) {
      input = api.MyRegex.replaceViewRefs(input, x.name);
      input = api.MyRegex.removeBracketsOnViewFieldRefs(input);

      substituteViewRefsRecursive({
        topView: x,
        view: x,
        partDeps: {},
        views: item.views
      });
    }

    x.derivedTableStart = input.split('\n');
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

    let { calcQuery, extraUdfs, varsSubElements } = barSpecial.genSub({
      select: Object.keys(item.view.asDeps[as].fieldNames),
      view: depView
    });

    Object.keys(extraUdfs).forEach(udfName => {
      if (item.topView.udfs.indexOf(udfName) < 0) {
        item.topView.udfs.push(udfName);
      }
    });

    let content: string[] = [];
    content.push(`  ${viewPartName} AS (`);
    content = content.concat(calcQuery.map((s: string) => `    ${s}`));
    content.push('  ),');

    let text = content.join('\n');
    text = api.MyRegex.replaceViewRefs(text, depView.name);
    text = api.MyRegex.removeBracketsOnViewFieldRefs(text);

    let viewPart: interfaces.ViewPart = {
      viewName: depView.name,
      sql: text.split('\n'),
      deps: {},
      varsSubElements: varsSubElements
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
