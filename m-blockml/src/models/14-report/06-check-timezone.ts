import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';
import { types } from '../../barrels/types';
import { ConfigService } from '@nestjs/config';

let func = enums.FuncEnum.CheckTimezone;

export function checkTimezone<T extends types.dzType>(item: {
  entities: Array<T>;
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
  cs: ConfigService;
}) {
  let { caller, structId, cs } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let timezonesHash: { [tzValue: string]: number } = {};

  api.timezones.forEach(group => {
    group.zones.forEach(tz => {
      timezonesHash[tz.value] = 1;
    });
  });

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.reports.forEach(report => {
      if (!report.timezone) {
        report.timezone = constants.UTC;
        return;
      }

      if (Object.keys(timezonesHash).indexOf(report.timezone) < 0) {
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
      newEntities.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(
    cs,
    caller,
    func,
    structId,
    enums.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}
