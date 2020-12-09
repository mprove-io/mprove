import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { constants } from '../../barrels/constants';
import { interfaces } from '../../barrels/interfaces';
import { substituteViewRefsRecursive } from './process-view-refs/substitute-view-refs-recursive';
import { BmError } from '../bm-error';

let toposort = require('toposort');

let func = enums.FuncEnum.ProcessViewRefs;

export function processViewRefs(item: {
  views: interfaces.View[];
  udfsDict: interfaces.UdfsDict;
  weekStart: api.ProjectWeekStartEnum;
  projectId: string;
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  item.views.forEach(x => {
    x.parts = {};

    if (helper.isDefined(x.derived_table)) {
      // x.derivedTableFullArray = x.derived_table.split('\n');
      x.derivedTableStart = x.derived_table;
      x.derivedTableNew = x.derived_table;
    }

    if (Object.keys(x.asDeps).length === 0) {
      return;
    }

    // x.derivedTableFullArray =
    substituteViewRefsRecursive({
      topView: x,
      parentViewName: x.name,
      parentDeps: {},
      input: x.derived_table,
      views: item.views,
      udfsDict: item.udfsDict,
      weekStart: item.weekStart,
      connection: x.connection,
      projectId: item.projectId,
      structId: item.structId
    }).split('\n');

    let text = x.derived_table;

    text = api.MyRegex.replaceViewRefs(text, x.name);
    text = api.MyRegex.removeBracketsOnViewFieldRefs(text);

    x.derivedTableStart = text;

    let partNamesSorted: string[] = [];

    let graph = [];

    let zeroDepsViewPartNames = [];

    Object.keys(x.parts).forEach(viewPartName => {
      Object.keys(x.parts[viewPartName].deps).forEach(dep => {
        graph.push([viewPartName, dep]);
      });
    });

    partNamesSorted = toposort(graph).reverse();

    Object.keys(x.parts).forEach(viewPartName => {
      if (partNamesSorted.indexOf(viewPartName) < 0) {
        zeroDepsViewPartNames.push(viewPartName);
      }
    });

    partNamesSorted = [...zeroDepsViewPartNames, ...partNamesSorted];

    let count = 0;

    let textStart;

    partNamesSorted.forEach(viewPartName => {
      count++;

      let content = x.parts[viewPartName].content;

      content = api.MyRegex.replaceViewRefs(
        content,
        x.parts[viewPartName].parentViewName
      );

      content = api.MyRegex.removeBracketsOnViewFieldRefs(content);

      x.parts[viewPartName].contentPrepared = content;

      if (count === Object.keys(x.parts).length) {
        // remove last comma
        content = content.slice(0, -1);
      }

      textStart = [textStart, content].join('\n');
    });

    text = [textStart, text].join('\n');

    text = [constants.WITH, text].join('\n');

    x.derivedTableNew = text;
    x.derivedTableNewArray = text.split('\n');
    // TODO: do not swap derived tables
    // make-contents line 143
    // let derivedSql = join.view.derived_table; -> join.view.derivedTableNew
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Views, item.views);

  return item.views;
}
