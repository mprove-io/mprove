// import { AmError } from '../../barrels/am-error';
// import { ApRegex } from '../../barrels/am-regex';
// import { ErrorsCollector } from '../../barrels/errors-collector';
// import { enums } from '../../barrels/enums';
// import { interfaces } from '../../barrels/interfaces';

// export function checkCalculations<
//   T extends interfaces.View | interfaces.Model
// >(item: { entities: Array<T> }): Array<T> {
//   item.entities.forEach((x: T) => {
//     let newFields: interfaces.FieldExt[] = [];

//     x.fields.forEach(field => {
//       if (field.field_class !== enums.FieldClassEnum.Calculation) {
//         newFields.push(field);
//         return;
//       }
//       // calculations

//       if (field.sql && !field.sql.match(ApRegex.CONTAINS_BLOCKML_REF())) {
//         // error e279
//         ErrorsCollector.addError(
//           new AmError({
//             title: `missing blockml reference`,
//             message: `calculation sql must have BlockML reference`,
//             lines: [
//               {
//                 line: field.sql_line_num,
//                 name: x.file,
//                 path: x.path
//               }
//             ]
//           })
//         );
//         return;
//       }

//       newFields.push(field);
//     });

//     x.fields = newFields;
//   });

//   return item.entities;
// }
