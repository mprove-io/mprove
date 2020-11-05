// import { AmError } from '../../barrels/am-error';
// import { ApRegex } from '../../barrels/am-regex';
// import { ErrorsCollector } from '../../barrels/errors-collector';

// export function checkTopUnknownParameters(item: { filesAny: any[] }): any[] {
//   item.filesAny.forEach(file => {
//     Object.keys(file)
//       .filter(x => !x.toString().match(ApRegex.ENDS_WITH_LINE_NUM()))
//       .forEach(parameter => {
//         if (['path', 'ext', 'name'].indexOf(parameter) > -1) {
//           return;
//         }

//         switch (file.ext) {
//           case '.udf': {
//             if (['udf', 'sql'].indexOf(parameter) < 0) {
//               // error e209
//               ErrorsCollector.addError(
//                 new AmError({
//                   title: `unknown udf parameter`,
//                   message: `parameter "${parameter}" can not be used on top level of .udf file`,
//                   lines: [
//                     {
//                       line: file[parameter + '_line_num'],
//                       name: file.name,
//                       path: file.path
//                     }
//                   ]
//                 })
//               );

//               delete file[parameter];
//               delete file[parameter + '_line_num'];
//               return;
//             }
//             break;
//           }

//           case '.view': {
//             if (
//               [
//                 'view',
//                 'label',
//                 'description',
//                 'udfs',
//                 'table',
//                 'derived_table',
//                 'permanent',
//                 'pdt_trigger_time',
//                 'pdt_trigger_sql',
//                 'fields'
//               ].indexOf(parameter) < 0
//             ) {
//               // error e116
//               ErrorsCollector.addError(
//                 new AmError({
//                   title: `unknown view parameter`,
//                   message: `parameter "${parameter}" can not be used on top level of .view file`,
//                   lines: [
//                     {
//                       line: file[parameter + '_line_num'],
//                       name: file.name,
//                       path: file.path
//                     }
//                   ]
//                 })
//               );

//               delete file[parameter];
//               delete file[parameter + '_line_num'];
//               return;
//             }
//             break;
//           }

//           case '.model': {
//             if (
//               [
//                 'model',
//                 'hidden',
//                 'label',
//                 'group',
//                 'description',
//                 'access_users',
//                 'always_join',
//                 'sql_always_where',
//                 'sql_always_where_calc',
//                 'udfs',
//                 'joins',
//                 'fields'
//               ].indexOf(parameter) < 0
//             ) {
//               // error e117
//               ErrorsCollector.addError(
//                 new AmError({
//                   title: `unknown model parameter`,
//                   message: `parameter "${parameter}" can not be used on top level of .model file`,
//                   lines: [
//                     {
//                       line: file[parameter + '_line_num'],
//                       name: file.name,
//                       path: file.path
//                     }
//                   ]
//                 })
//               );

//               delete file[parameter];
//               delete file[parameter + '_line_num'];
//               return;
//             }
//             break;
//           }

//           case '.dashboard': {
//             if (
//               [
//                 'dashboard',
//                 'title',
//                 'group',
//                 'hidden',
//                 'description',
//                 'access_users',
//                 'fields',
//                 'reports'
//               ].indexOf(parameter) < 0
//             ) {
//               // error e118
//               ErrorsCollector.addError(
//                 new AmError({
//                   title: `unknown dashboard parameter`,
//                   message: `parameter "${parameter}" can not be used on top level of .dashboard file`,
//                   lines: [
//                     {
//                       line: file[parameter + '_line_num'],
//                       name: file.name,
//                       path: file.path
//                     }
//                   ]
//                 })
//               );

//               delete file[parameter];
//               delete file[parameter + '_line_num'];
//               return;
//             }
//             break;
//           }
//         }

//         if (
//           Array.isArray(file[parameter]) &&
//           ['udfs', 'fields', 'reports', 'joins', 'access_users'].indexOf(
//             parameter
//           ) < 0
//         ) {
//           // error e120
//           ErrorsCollector.addError(
//             new AmError({
//               title: `unexpected List`,
//               message: `parameter "${parameter}" must have a single value`,
//               lines: [
//                 {
//                   line: file[parameter + '_line_num'],
//                   name: file.name,
//                   path: file.path
//                 }
//               ]
//             })
//           );

//           delete file[parameter];
//           delete file[parameter + '_line_num'];
//           return;
//         } else if (
//           !!file[parameter] &&
//           file[parameter].constructor === Object
//         ) {
//           // error e121
//           ErrorsCollector.addError(
//             new AmError({
//               title: `unexpected Hash`,
//               message: `parameter "${parameter}" must have a single value`,
//               lines: [
//                 {
//                   line: file[parameter + '_line_num'],
//                   name: file.name,
//                   path: file.path
//                 }
//               ]
//             })
//           );

//           delete file[parameter];
//           delete file[parameter + '_line_num'];
//           return;
//         }
//       });
//   });

//   return item.filesAny;
// }
