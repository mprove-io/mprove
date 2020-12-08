// import { ApRegex } from '../../barrels/am-regex';
// import { interfaces } from '../../barrels/interfaces';
// import { api } from '../../barrels/api';

// export function processTimezone(item: interfaces.Vars) {
//   item.query.forEach((element, i, a) => {
//     let reg = ApRegex.TIMESTAMP_START_END();
//     let r;

//     while ((r = reg.exec(element))) {
//       let one = r[1];
//       let two = r[2];
//       let three = r[3];

//       if (item.timezone === 'UTC') {
//         element = one + two + three;
//       } else if (item.connection === api.ProjectConnectionEnum.BigQuery) {
//         element =
//           one +
//           `TIMESTAMP(FORMAT_TIMESTAMP('%F %T', ${two}, '${item.timezone}'))` +
//           three;
//       } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
//         element =
//           one + `TIMEZONE('${item.timezone}', ${two}::TIMESTAMPTZ)` + three;
//       }
//     }
//     a[i] = element;
//   });

//   return item;
// }
