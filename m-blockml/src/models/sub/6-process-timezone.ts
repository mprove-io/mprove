import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';
import { api } from '../../barrels/api';

export function processTimezone(item: interfaces.VarsSub) {
  item.query.forEach((element, i, a) => {
    let reg = api.MyRegex.TIMESTAMP_START_END();
    let r;

    while ((r = reg.exec(element))) {
      let one = r[1];
      let two = r[2];
      let three = r[3];

      if (item.timezone === constants.UTC) {
        element = one + two + three;
      } else if (item.connection.type === api.ConnectionTypeEnum.BigQuery) {
        element =
          one +
          `TIMESTAMP(FORMAT_TIMESTAMP('%F %T', ${two}, '${item.timezone}'))` +
          three;
      } else if (item.connection.type === api.ConnectionTypeEnum.PostgreSQL) {
        element =
          one + `TIMEZONE('${item.timezone}', ${two}::TIMESTAMPTZ)` + three;
      }
    }
    a[i] = element;
  });

  return item;
}
