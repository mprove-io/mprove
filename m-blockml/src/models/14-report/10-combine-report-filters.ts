import { ConfigService } from '@nestjs/config';
import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';
import { helper } from '~/barrels/helper';
import { interfaces } from '~/barrels/interfaces';
import { types } from '~/barrels/types';
import { BmError } from '~/models/bm-error';

let func = enums.FuncEnum.CombineReportFilters;

export function combineReportFilters<T extends types.dzType>(
  item: {
    entities: Array<T>;
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  item.entities.forEach(x => {
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

        let dashFilter = Object.keys((<interfaces.Dashboard>x).filters).find(
          f => f === listen
        );

        report.combinedFilters[listenFilter] = helper.makeCopy(
          (<interfaces.Dashboard>x).filters[dashFilter]
        );
      });
    });
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(
    cs,
    caller,
    func,
    structId,
    enums.LogTypeEnum.Entities,
    item.entities
  );

  return item.entities;
}
