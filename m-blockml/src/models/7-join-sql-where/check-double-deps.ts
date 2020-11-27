// import { AmError } from '../../barrels/am-error';
// import { ErrorsCollector } from '../../barrels/errors-collector';
// import { enums } from '../../barrels/enums';
// import { interfaces } from '../../barrels/interfaces';

// export function checkDoubleDeps(item: { models: interfaces.Model[] }) {
//   let newModels: interfaces.Model[] = [];

//   item.models.forEach(x => {
//     let nextModel: boolean = false;

//     x.joins
//       .filter(j => j.as !== x.from_as)
//       .forEach(join => {
//         if (nextModel) {
//           return;
//         }

//         Object.keys(join.sql_where_double_deps).forEach(depAs => {
//           if (nextModel) {
//             return;
//           }

//           let depJoin = x.joins.find(j => j.as === depAs);

//           if (!depJoin) {
//             // error e158
//             ErrorsCollector.addError(
//               new AmError({
//                 title: `wrong alias in Join sql_where reference`,
//                 message:
//                   `found referencing on alias "${depAs}" that is missing in joins elements. ` +
//                   `Check "as:" values.`,
//                 lines: [
//                   {
//                     line: join.sql_where_line_num,
//                     name: x.file,
//                     path: x.path
//                   }
//                 ]
//               })
//             );

//             nextModel = true;
//             return;
//           }

//           Object.keys(join.sql_where_double_deps[depAs]).forEach(
//             depFieldName => {
//               if (nextModel) {
//                 return;
//               }

//               let depField = depJoin.view.fields.find(
//                 f => f.name === depFieldName
//               );

//               if (!depField) {
//                 // error e159
//                 ErrorsCollector.addError(
//                   new AmError({
//                     title: `Join sql_where refs missing field`,
//                     message: `found referencing to field "${depFieldName}" of view "${
//                       depJoin.view.name
//                     }" as "${depAs}"`,
//                     lines: [
//                       {
//                         line: join.sql_where_line_num,
//                         name: x.file,
//                         path: x.path
//                       }
//                     ]
//                   })
//                 );

//                 nextModel = true;
//                 return;
//               } else if (depField.field_class === enums.FieldClassEnum.Filter) {
//                 // error e243
//                 ErrorsCollector.addError(
//                   new AmError({
//                     title: `Join sql_where refs filter`,
//                     message:
//                       `Join "sql_where:" can not reference filters. ` +
//                       `found referencing filter "${depFieldName}" of view "${
//                         depJoin.view.name
//                       }" as "${depAs}"`,
//                     lines: [
//                       {
//                         line: join.sql_where_line_num,
//                         name: x.file,
//                         path: x.path
//                       }
//                     ]
//                   })
//                 );

//                 nextModel = true;
//                 return;
//               } else if (
//                 depField.field_class === enums.FieldClassEnum.Measure
//               ) {
//                 // error e160
//                 ErrorsCollector.addError(
//                   new AmError({
//                     title: `Join sql_where refs measure`,
//                     message:
//                       `Join "sql_where:" can not reference measures. ` +
//                       `found referencing measure "${depFieldName}" of view "${
//                         depJoin.view.name
//                       }" as "${depAs}"`,
//                     lines: [
//                       {
//                         line: join.sql_where_line_num,
//                         name: x.file,
//                         path: x.path
//                       }
//                     ]
//                   })
//                 );

//                 nextModel = true;
//                 return;
//               } else if (
//                 depField.field_class === enums.FieldClassEnum.Calculation
//               ) {
//                 // error e161
//                 ErrorsCollector.addError(
//                   new AmError({
//                     title: `Join sql_where refs calculation`,
//                     message:
//                       `Join "sql_where:" can not reference calculations. ` +
//                       `found referencing calculation "${depFieldName}" of view "${
//                         depJoin.view.name
//                       }" as "${depAs}"`,
//                     lines: [
//                       {
//                         line: join.sql_where_line_num,
//                         name: x.file,
//                         path: x.path
//                       }
//                     ]
//                   })
//                 );

//                 nextModel = true;
//                 return;
//               }
//             }
//           );
//         });
//       });

//     if (nextModel) {
//       return;
//     }

//     newModels.push(x);
//   });

//   return newModels;
// }
