import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckTimezone;

export function checkTimezone<T extends types.dzType>(
  item: {
    entities: Array<T>;
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
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
