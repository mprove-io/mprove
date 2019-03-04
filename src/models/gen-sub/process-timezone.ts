import { ApRegex } from '../../barrels/am-regex';
import { interfaces } from '../../barrels/interfaces';

export function processTimezone(item: interfaces.VarsSub) {

  item.query.forEach((element, i, a) => {

    let reg = ApRegex.TIMESTAMP_START_END();
    let r;

    while (r = reg.exec(element)) {
      let one = r[1];
      let two = r[2];
      let three = r[3];

      element = item.timezone === 'UTC'
        ? one + two + three
        : `${one}TIMESTAMP(FORMAT_TIMESTAMP('%F %T', ${two}, '${item.timezone}'))${three}`;

    }
    a[i] = element;
  });

  return item;
}
