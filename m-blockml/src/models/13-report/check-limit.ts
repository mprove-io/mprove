// import { AmError } from '../../barrels/am-error';
// import { ApRegex } from '../../barrels/am-regex';
// import { ErrorsCollector } from '../../barrels/errors-collector';
// import { interfaces } from '../../barrels/interfaces';

// export function checkLimit(item: { dashboards: interfaces.Dashboard[] }) {
//   item.dashboards.forEach(x => {
//     x.reports.forEach(report => {
//       if (!report.limit) {
//         report.limit = '500';
//         return;
//       }

//       let reg = ApRegex.CAPTURE_DIGITS_START_TO_END_G();
//       let r = reg.exec(report.limit);

//       if (r) {
//         let limitNumber = Number(r[1]);

//         report.limit = limitNumber > 500 ? '500' : limitNumber.toString();
//       } else {
//         // error e168
//         ErrorsCollector.addError(
//           new AmError({
//             title: `wrong 'limit' value`,
//             message: `'limit' must contain positive integer value`,
//             lines: [
//               {
//                 line: report.limit_line_num,
//                 name: x.file,
//                 path: x.path
//               }
//             ]
//           })
//         );

//         report.limit = '500';
//         return;
//       }
//     });
//   });

//   return item.dashboards;
// }
