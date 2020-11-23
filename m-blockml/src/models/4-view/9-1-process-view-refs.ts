import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { constants } from '../../barrels/constants';
import { interfaces } from '../../barrels/interfaces';
import { substituteViewRefsRecursive } from './9-2-substitute-view-refs-recursive';
let toposort = require('toposort');

let func = enums.FuncEnum.ProcessViewRefs;

export function processViewRefs(item: {
  views: interfaces.View[];
  udfsDict: interfaces.UdfsDict;
  weekStart: api.ProjectWeekStartEnum;
  projectId: string;
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  item.views.forEach(x => {
    x.parts = {};

    x.derivedTableStart = x.derived_table;

    if (Object.keys(x.asDeps).length === 0) {
      return;
    }

    let derivedTableNew = x.derived_table;

    derivedTableNew = substituteViewRefsRecursive({
      topView: x,
      parentViewName: x.name,
      parentDeps: {},
      input: derivedTableNew,
      views: item.views,
      udfsDict: item.udfsDict,
      weekStart: item.weekStart,
      connection: x.connection,
      projectId: item.projectId,
      structId: item.structId
    });

    let text = x.derived_table;

    text = api.MyRegex.replaceViewRefs(text, x.name);
    text = api.MyRegex.removeBracketsOnViewFieldRefs(text);

    x.derivedTableStart = text;

    let partNamesSorted: string[] = [];

    let graph = [];

    Object.keys(x.parts).forEach(viewPartName => {
      Object.keys(x.parts[viewPartName].deps).forEach(dep => {
        graph.push([viewPartName, dep]);
      });
    });

    partNamesSorted = toposort(graph).reverse();

    let count = 0;

    partNamesSorted.forEach(viewPartName => {
      count++;

      let content = x.parts[viewPartName].content;
      content = api.MyRegex.replaceViewRefs(
        content,
        x.parts[viewPartName].parentViewName
      );
      content = api.MyRegex.removeBracketsOnViewFieldRefs(content);

      x.parts[viewPartName].contentPrepared = content;

      if (count === 1) {
        // remove last comma
        content = content.slice(0, -1);
      }

      text = [content, text].join('\n');
    });

    text = [constants.WITH, text].join('\n');

    x.derived_table = text;
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Views, item.views);

  return item.views;
}
