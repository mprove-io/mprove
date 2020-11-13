// import { AmError } from '../../barrels/am-error';
// import { ErrorsCollector } from '../../barrels/errors-collector';
// import { interfaces } from '../../barrels/interfaces';

// export function checkFieldNameDuplicates<
//   T extends interfaces.View | interfaces.Model | interfaces.Dashboard
// >(item: { entities: Array<T> }) {
//   item.entities.forEach(x => {
//     // prepare field names
//     let fieldNames: { name: string; line_numbers: number[] }[] = [];

//     x.fields.forEach(field => {
//       let fName = fieldNames.find(element => element.name === field.name);

//       if (fName) {
//         fName.line_numbers.push(field.name_line_num);
//       } else {
//         fieldNames.push({
//           name: field.name,
//           line_numbers: [field.name_line_num]
//         });
//       }
//     });

//     // process field names
//     let newFields: interfaces.FieldExt[] = [];

//     fieldNames.forEach(fieldN => {
//       if (fieldN.line_numbers.length > 1) {
//         // error e26
//         let lines: interfaces.ErrorLine[] = fieldN.line_numbers.map(y => ({
//           line: y,
//           name: x.file,
//           path: x.path
//         }));

//         ErrorsCollector.addError(
//           new AmError({
//             title: 'duplicate field names',
//             message:
//               `Dimensions, Times, Measures, Calculations and Filters must have` +
//               ` unique names across "fields" section`,
//             lines: lines
//           })
//         );
//       } else {
//         newFields.push(x.fields.find(element => element.name === fieldN.name));
//       }
//     });

//     x.fields = newFields;
//   });

//   return item.entities;
// }
