import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CombineReportFilters;

export function combineReportFilters<T extends types.dzType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  item.entities.forEach(x => {
    x.reports.forEach(report => {
      report.combinedFilters = {};

      Object.keys(report.default_filters)
        .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(defaultFilter => {
          report.combinedFilters[defaultFilter] = common.makeCopy(
            report.default_filters[defaultFilter]
          );
        });

      // default override by listen
      Object.keys(report.listen).forEach(listenFilter => {
        let listen = report.listen[listenFilter];

        let dashFilter = Object.keys((<common.FileDashboard>x).filters).find(
          f => f === listen
        );

        report.combinedFilters[listenFilter] = common.makeCopy(
          (<common.FileDashboard>x).filters[dashFilter]
        );
      });
    });
  });

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Entities,
    item.entities
  );

  return item.entities;
}
