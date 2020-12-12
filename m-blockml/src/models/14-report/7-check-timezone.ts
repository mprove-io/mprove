import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';

let func = enums.FuncEnum.CheckTimezone;

export function checkTimezone(item: {
  dashboards: interfaces.Dashboard[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let timezonesHash: { [tzValue: string]: number } = {};

  api.timezones.forEach(group => {
    group.zones.forEach(tz => {
      timezonesHash[tz.value] = 1;
    });
  });

  let newDashboards: interfaces.Dashboard[] = [];

  item.dashboards.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.reports.forEach(report => {
      if (!report.timezone) {
        report.timezone = constants.UTC;
        return;
      }

      if (Object.keys(timezonesHash).indexOf(report.timezone) < 0) {
        // error e218
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.REPORT_WRONG_TIMEZONE,
            message:
              `${enums.ParameterEnum.Timezone} must be one of ` +
              'Mprove Timezone Selector values',
            lines: [
              {
                line: report.timezone_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }
    });

    if (errorsOnStart === item.errors.length) {
      newDashboards.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Ds, newDashboards);

  return newDashboards;
}
