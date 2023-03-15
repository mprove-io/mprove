import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';
let Graph = require('tarjan-graph');

let func = common.FuncEnum.CheckViewCycles;

export function checkViewCycles(
  item: {
    views: common.FileView[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

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
      let cycledNames: string[] = cycle.map((c: any) => c.name);

      let lines: common.BmErrorLine[] = [];

      cycledNames.forEach(cName => {
        let cycledView = item.views.find(v => v.name === cName);

        lines.push({
          line: cycledView.derived_table_line_num,
          name: cycledView.fileName,
          path: cycledView.filePath
        });
      });

      let cycledNamesString: string = cycledNames.join('", "');
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.DERIVED_TABLE_CYCLE_IN_VIEW_REFERENCES,
          message: `Views "${cycledNamesString}" references each other by cycle`,
          lines: lines
        })
      );

      errorViewNames = [...errorViewNames, ...cycledNames];

      return;
    });
  }

  errorViewNames = [...new Set(errorViewNames)];

  let newViews: common.FileView[] = [];

  item.views.forEach(view => {
    if (errorViewNames.indexOf(view.name) < 0) {
      newViews.push(view);
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
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Views, newViews);

  return newViews;
}
