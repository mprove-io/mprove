import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
let Graph = require('tarjan-graph');

let func = enums.FuncEnum.CheckViewCycles;

export function checkViewCycles(item: {
  views: interfaces.View[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let g = new Graph();

  item.views.forEach(x => {
    if (Object.keys(x.asDeps).length > 0) {
      Object.keys(x.asDeps).forEach(as => {
        g.add(x.name, [x.asDeps[as].viewName]);
      });
    }
  });

  let errorViewNames: string[] = [];

  if (g.hasCycle()) {
    let cycles: any[] = g.getCycles();

    cycles.forEach(cycle => {
      let cycledNames: string[] = cycle.map(c => c.name);

      let lines: interfaces.BmErrorCLine[] = [];

      cycledNames.forEach(cName => {
        let cycledView = item.views.find(v => v.name === cName);

        lines.push({
          line: cycledView.derived_table_line_num,
          name: cycledView.fileName,
          path: cycledView.filePath
        });
      });

      let cycledNamesString: string = cycledNames.join('", "');
      // error e285
      item.errors.push(
        new BmError({
          title: enums.ErTitleEnum.CYCLE_IN_VIEW_REFERENCES,
          message: `Views "${cycledNamesString}" references each other by cycle`,
          lines: lines
        })
      );

      errorViewNames = [...errorViewNames, ...cycledNames];

      return;
    });
  }

  errorViewNames = [...new Set(errorViewNames)];

  let newViews: interfaces.View[] = [];

  item.views.forEach(view => {
    if (errorViewNames.indexOf(view.name) < 0) {
      newViews.push(view);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Views, newViews);

  return newViews;
}
