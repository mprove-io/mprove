// import { AmError } from '../../barrels/am-error';
// import { ErrorsCollector } from '../../barrels/errors-collector';
// import { interfaces } from '../../barrels/interfaces';

// export function checkViewUdfs(item: {
//   views: interfaces.View[];
//   udfs: interfaces.Udf[];
// }) {
//   let newViews: interfaces.View[] = [];

//   item.views.forEach(x => {
//     if (typeof x.udfs !== 'undefined' && x.udfs !== null) {
//       if (!Array.isArray(x.udfs)) {
//         // error e211
//         ErrorsCollector.addError(
//           new AmError({
//             title: `udfs must be an Array`,
//             message: `"udfs" must have element(s) inside like:
// - 'user_defined_function_name'
// - 'user_defined_function_name'`,
//             lines: [
//               {
//                 line: x.udfs_line_num,
//                 name: x.file,
//                 path: x.path
//               }
//             ]
//           })
//         );
//         return;
//       } else {
//         let nextView: boolean = false;

//         x.udfs.forEach(u => {
//           if (nextView) {
//             return;
//           }

//           if (item.udfs.findIndex(udf => udf.name === u) < 0) {
//             // error e212
//             ErrorsCollector.addError(
//               new AmError({
//                 title: `wrong udf`,
//                 message: `found element "- ${u}" references missing or not valid udf`,
//                 lines: [
//                   {
//                     line: x.udfs_line_num,
//                     name: x.file,
//                     path: x.path
//                   }
//                 ]
//               })
//             );

//             nextView = true;
//             return;
//           }
//         });

//         if (nextView) {
//           return;
//         }
//       }
//     }

//     newViews.push(x);
//   });

//   return newViews;
// }
