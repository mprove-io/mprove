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

    let text =
      Object.keys(x.asDeps).length === 0
        ? x.derived_table
        : substituteViewRefsRecursive({
            topView: x,
            viewName: x.name,
            input: x.derived_table,
            partDeps: {},
            views: item.views,
            udfsDict: item.udfsDict,
            weekStart: item.weekStart,
            connection: x.connection,
            structId: item.structId
          });

    x.derivedTableStart = text.split('\n');
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Views, item.views);

  return item.views;
}

function substituteViewRefsRecursive(item: {
  topView: interfaces.View;
  viewName: string;
  input: string;
  partDeps: interfaces.ViewPart['deps'];
  views: interfaces.View[];
  udfsDict: api.UdfsDict;
  weekStart: api.ProjectWeekStartEnum;
  connection: api.ProjectConnection;
  structId: string;
}) {
  let input = item.input;

  let asDeps: interfaces.View['asDeps'] = getAsDeps(input);

  input = api.MyRegex.replaceViewRefs(input, item.viewName);
  input = api.MyRegex.removeBracketsOnViewFieldRefs(input);

  Object.keys(asDeps).forEach(as => {
    let depView = item.views.find(v => v.name === asDeps[as].viewName);

    let viewPartName = `${item.viewName}__${depView.name}__${as}`;

    let sub = barSpecial.genSub({
      select: Object.keys(asDeps[as].fieldNames),
      view: depView,
      udfsDict: item.udfsDict,
      weekStart: item.weekStart,
      connection: item.connection,
      structId: item.structId
    });

    Object.keys(sub.extraUdfs).forEach(udfName => {
      if (item.topView.udfs.indexOf(udfName) < 0) {
        item.topView.udfs.push(udfName);
      }
    });

    let content: string[] = [];
    content.push(`  ${viewPartName} AS (`);
    content = content.concat(sub.query.map((s: string) => `    ${s}`));
    content.push('  ),');

    let text = content.join('\n');
    text = api.MyRegex.replaceViewRefs(text, depView.name);
    text = api.MyRegex.removeBracketsOnViewFieldRefs(text);

    let viewPart: interfaces.ViewPart = {
      viewName: depView.name,
      sql: text.split('\n'),
      deps: {}
    };

    item.partDeps[viewPartName] = 1;

    item.topView.parts[viewPartName] = viewPart;

    let newInput = content.join('\n');

    let newAsDeps: interfaces.View['asDeps'] = getAsDeps(newInput);

    if (Object.keys(newAsDeps).length > 0) {
      substituteViewRefsRecursive({
        topView: item.topView,
        viewName: depView.name,
        partDeps: viewPart.deps,
        input: newInput,
        views: item.views,
        udfsDict: item.udfsDict,
        weekStart: item.weekStart,
        connection: item.connection,
        structId: item.structId
      });
    }
  });

  return input;
}

function getAsDeps(input: string) {
  let asDeps: interfaces.View['asDeps'] = {};

  let reg = api.MyRegex.CAPTURE_VIEW_REF_G();
  let r;

  while ((r = reg.exec(input))) {
    let view: string = r[1];
    let alias: string = r[2];

    if (helper.isUndefined(asDeps[alias])) {
      asDeps[alias] = { viewName: view, fieldNames: {} };
    }
  }

  let reg2 = api.MyRegex.CAPTURE_DOUBLE_REF_G();
  let r2;

  while ((r2 = reg2.exec(input))) {
    let as: string = r2[1];
    let dep: string = r2[2];

    asDeps[as].fieldNames[dep] = 1;
  }

  return asDeps;
}
