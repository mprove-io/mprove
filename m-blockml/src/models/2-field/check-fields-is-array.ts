// import { AmError } from '../../barrels/am-error';
// import { ErrorsCollector } from '../../barrels/errors-collector';
// import { interfaces } from '../../barrels/interfaces';

// export function checkFieldsIsArray<
//   T extends interfaces.View | interfaces.Model | interfaces.Dashboard
// >(item: { entities: Array<T> }) {
//   item.entities.forEach(x => {
//     if (typeof x.fields === 'undefined' || x.fields === null) {
//       x.fields = [];
//       return;
//     } else if (!Array.isArray(x.fields)) {
//       // error e68
//       ErrorsCollector.addError(
//         new AmError({
//           title: `fields is not a List`,
//           message: `fields must be a List of objects`,
//           lines: [
//             {
//               line: x.fields_line_num,
//               name: x.file,
//               path: x.path
//             }
//           ]
//         })
//       );

//       x.fields = [];
//       return;
//     }
//   });

//   return item.entities;
// }
