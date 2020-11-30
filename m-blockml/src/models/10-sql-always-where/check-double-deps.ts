// import { AmError } from '../../barrels/am-error';
// import { ErrorsCollector } from '../../barrels/errors-collector';
// import { enums } from '../../barrels/enums';
// import { interfaces } from '../../barrels/interfaces';

// export function checkDoubleDeps(item: { models: interfaces.Model[] }) {
//   let newModels: interfaces.Model[] = [];

//   item.models.forEach(x => {
//     let nextModel: boolean = false;

//     if (
//       typeof x.sql_always_where === 'undefined' ||
//       x.sql_always_where === null
//     ) {
//       newModels.push(x);
//       return;
//     }

//     Object.keys(x.sql_always_where_double_deps).forEach(depAs => {
//       if (nextModel) {
//         return;
//       }

//       let depJoin = x.joins.find(j => j.as === depAs);

//       if (!depJoin) {
//         // error e145
//         ErrorsCollector.addError(
//           new AmError({
//             title: `wrong alias in sql_always_where reference`,
//             message:
//               `found referencing on alias "${depAs}" that is missing in joins elements. ` +
//               `Check "as:" values.`,
//             lines: [
//               {
//                 line: x.sql_always_where_line_num,
//                 name: x.file,
//                 path: x.path
//               }
//             ]
//           })
//         );

//         nextModel = true;
//         return;
//       }

//       Object.keys(x.sql_always_where_double_deps[depAs]).forEach(
//         depFieldName => {
//           if (nextModel) {
//             return;
//           }

//           let depField = depJoin.view.fields.find(f => f.name === depFieldName);

//           if (!depField) {
//             // error e146
//             ErrorsCollector.addError(
//               new AmError({
//                 title: `sql_always_where refs missing field`,
//                 message: `found referencing to field "${depFieldName}" of view "${
//                   depJoin.view.name
//                 }" as "${depAs}"`,
//                 lines: [
//                   {
//                     line: x.sql_always_where_line_num,
//                     name: x.file,
//                     path: x.path
//                   }
//                 ]
//               })
//             );

//             nextModel = true;
//             return;
//           } else if (depField.field_class === enums.FieldClassEnum.Filter) {
//             // error e245
//             ErrorsCollector.addError(
//               new AmError({
//                 title: `sql_always_where refs filter`,
//                 message:
//                   `sql_always_where can not reference filters. ` +
//                   `Found referencing filter "${depFieldName}" of view "${
//                     depJoin.view.name
//                   }" as "${depAs}"`,
//                 lines: [
//                   {
//                     line: x.sql_always_where_line_num,
//                     name: x.file,
//                     path: x.path
//                   }
//                 ]
//               })
//             );

//             nextModel = true;
//             return;
//           } else if (depField.field_class === enums.FieldClassEnum.Measure) {
//             // error e147
//             ErrorsCollector.addError(
//               new AmError({
//                 title: `sql_always_where refs measure`,
//                 message:
//                   `sql_always_where can not reference measures. ` +
//                   `Found referencing measure "${depFieldName}" of view "${
//                     depJoin.view.name
//                   }" as "${depAs}"`,
//                 lines: [
//                   {
//                     line: x.sql_always_where_line_num,
//                     name: x.file,
//                     path: x.path
//                   }
//                 ]
//               })
//             );

//             nextModel = true;
//             return;
//           } else if (
//             depField.field_class === enums.FieldClassEnum.Calculation
//           ) {
//             // error e148
//             ErrorsCollector.addError(
//               new AmError({
//                 title: `sql_always_where refs calculation`,
//                 message:
//                   `sql_always_where can not reference calculations. ` +
//                   `Found referencing calculation "${depFieldName}" of view "${
//                     depJoin.view.name
//                   }" as "${depAs}"`,
//                 lines: [
//                   {
//                     line: x.sql_always_where_line_num,
//                     name: x.file,
//                     path: x.path
//                   }
//                 ]
//               })
//             );

//             nextModel = true;
//             return;
//           }
//         }
//       );
//     });

//     if (nextModel) {
//       return;
//     }

//     newModels.push(x);
//   });

//   return newModels;
// }
