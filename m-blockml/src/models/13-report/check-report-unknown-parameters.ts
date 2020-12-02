// import { AmError } from '../../barrels/am-error';
// import { ApRegex } from '../../barrels/am-regex';
// import { ErrorsCollector } from '../../barrels/errors-collector';
// import { interfaces } from '../../barrels/interfaces';

// export function checkReportUnknownParameters(item: {
//   dashboards: interfaces.Dashboard[];
// }) {
//   item.dashboards.forEach(x => {
//     x.reports.forEach(report => {
//       Object.keys(report)
//         .filter(k => !k.match(ApRegex.ENDS_WITH_LINE_NUM()))
//         .forEach(parameter => {
//           if (
//             [
//               'title',
//               'description',
//               'model',
//               'select',
//               'sorts',
//               'timezone',
//               'limit',
//               'listen_filters',
//               'default_filters',
//               'type',
//               'data',
//               'axis',
//               'options',
//               'tile'
//             ].indexOf(parameter) < 0
//           ) {
//             // error e133
//             ErrorsCollector.addError(
//               new AmError({
//                 title: `unknown report parameter`,
//                 message: `parameter '${parameter}' can not be used inside Report`,
//                 lines: [
//                   {
//                     line: (<any>report)[parameter + '_line_num'],
//                     name: x.file,
//                     path: x.path
//                   }
//                 ]
//               })
//             );
//             delete (<any>report)[parameter];
//             delete (<any>report)[parameter + '_line_num'];
//             return;
//           }

//           if (
//             Array.isArray((<any>report)[parameter]) &&
//             ['select'].indexOf(parameter) < 0
//           ) {
//             // error e134
//             ErrorsCollector.addError(
//               new AmError({
//                 title: `unexpected List`,
//                 message: `parameter '${parameter}' can not be a List`,
//                 lines: [
//                   {
//                     line: (<any>report)[parameter + '_line_num'],
//                     name: x.file,
//                     path: x.path
//                   }
//                 ]
//               })
//             );
//             delete (<any>report)[parameter];
//             delete (<any>report)[parameter + '_line_num'];
//             return;
//           }

//           if (
//             !!(<any>report)[parameter] &&
//             (<any>report)[parameter].constructor === Object &&
//             [
//               'default_filters',
//               'listen_filters',
//               'data',
//               'axis',
//               'options',
//               'tile'
//             ].indexOf(parameter) < 0
//           ) {
//             // error e135
//             ErrorsCollector.addError(
//               new AmError({
//                 title: `unexpected Hash`,
//                 message: `parameter '${parameter}' can not be a Hash`,
//                 lines: [
//                   {
//                     line: (<any>report)[parameter + '_line_num'],
//                     name: x.file,
//                     path: x.path
//                   }
//                 ]
//               })
//             );
//             delete (<any>report)[parameter];
//             delete (<any>report)[parameter + '_line_num'];
//             return;
//           }

//           if (
//             !(
//               !!(<any>report)[parameter] &&
//               (<any>report)[parameter].constructor === Object
//             ) &&
//             !Array.isArray((<any>report)[parameter]) &&
//             [
//               'select',
//               'default_filters',
//               'listen_filters',
//               'data',
//               'axis',
//               'options',
//               'tile'
//             ].indexOf(parameter) > -1
//           ) {
//             // error e170
//             ErrorsCollector.addError(
//               new AmError({
//                 title: `unexpected Single value`,
//                 message: `parameter '${parameter}' can not be a Single value`,
//                 lines: [
//                   {
//                     line: (<any>report)[parameter + '_line_num'],
//                     name: x.file,
//                     path: x.path
//                   }
//                 ]
//               })
//             );
//             delete (<any>report)[parameter];
//             delete (<any>report)[parameter + '_line_num'];
//             return;
//           }
//         });
//     });
//   });

//   return item.dashboards;
// }
