import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';

let func = enums.FuncEnum.CombineReportFilters;

export function combineReportFilters(item: {
  dashboards: interfaces.Dashboard[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  item.dashboards.forEach(x => {
    x.reports.forEach(report => {
      report.combinedFilters = {};

      Object.keys(report.default_filters)
        .filter(k => !k.match(api.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(defaultFilter => {
          report.combinedFilters[defaultFilter] = helper.makeCopy(
            report.default_filters[defaultFilter]
          );
        });

      // default override by listen
      Object.keys(report.listen).forEach(listenFilter => {
        let listen = report.listen[listenFilter];

        let dashFilter = Object.keys(x.filters).find(f => f === listen);

        report.combinedFilters[listenFilter] = helper.makeCopy(
          x.filters[dashFilter]
        );
      });
    });
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Ds, item.dashboards);

  return item.dashboards;
}
