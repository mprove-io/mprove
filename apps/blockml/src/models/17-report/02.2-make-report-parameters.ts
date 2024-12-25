import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.MakeReportParameters;

export function makeReportParameters(
  item: {
    reports: common.FileReport[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newReports: common.FileReport[] = [];

  item.reports.forEach(x => {
    let errorsOnStart = item.errors.length;

    let globalRowId = 'REPORT';
    let globalRowName = 'REPORT';

    let globalParameters: common.FileReportRowParameter[] = [];

    // if (common.isUndefined(x.parameters)) {
    //   x.parameters = [];
    // }

    x.fields.forEach(filter => {
      let newGlobalParameter: common.FileReportRowParameter = {
        type: common.ParameterTypeEnum.Field,
        filter: filter.name.replace(/[^a-zA-Z]/g, '_'),
        conditions: filter.conditions,
        globalFieldResult: filter.result
      };

      globalParameters.push(newGlobalParameter);
    });

    let globalRow: common.FileReportRow = {
      row_id: globalRowId,
      name: globalRowName,
      type: common.RowTypeEnum.Global,
      parameters: globalParameters
    };

    x.rows = [globalRow, ...x.rows];

    if (errorsOnStart === item.errors.length) {
      newReports.push(x);
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
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Entities,
    newReports
  );

  return newReports;
}
