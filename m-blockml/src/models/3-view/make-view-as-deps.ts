// import { AmError } from '../../barrels/am-error';
// import { ApRegex } from '../../barrels/am-regex';
// import { ErrorsCollector } from '../../barrels/errors-collector';
// import { interfaces } from '../../barrels/interfaces';

// export function makeViewAsDeps(item: { views: interfaces.View[] }) {
//   let newViews: interfaces.View[] = [];

//   item.views.forEach(x => {
//     // init
//     x.as_deps = {};

//     if (typeof x.derived_table !== 'undefined' && x.derived_table !== null) {
//       let input = x.derived_table;

//       // checking AS
//       let reg = ApRegex.CAPTURE_VIEW_REF_G();
//       let r;

//       while ((r = reg.exec(input))) {
//         let view: string = r[1];
//         let alias: string = r[2];

//         if (view === x.name) {
//           // error e282
//           ErrorsCollector.addError(
//             new AmError({
//               title: `view self reference`,
//               message: `derived_table contains reference to "${view}"`,
//               lines: [
//                 {
//                   line: x.derived_table_line_num,
//                   name: x.file,
//                   path: x.path
//                 }
//               ]
//             })
//           );
//           return;
//         }

//         if (!x.as_deps[alias]) {
//           x.as_deps[alias] = { view_name: view, fields: {} };
//         } else if (x.as_deps[alias].view_name !== view) {
//           // error e280
//           ErrorsCollector.addError(
//             new AmError({
//               title: `same alias for different views`,
//               message: `derived_table references different views using same alias "${alias}"`,
//               lines: [
//                 {
//                   line: x.derived_table_line_num,
//                   name: x.file,
//                   path: x.path
//                 }
//               ]
//             })
//           );
//           return;
//         }
//       }

//       // checking doubles
//       let reg2 = ApRegex.CAPTURE_DOUBLE_REF_G();
//       let r2;

//       while ((r2 = reg2.exec(input))) {
//         let as: string = r2[1];
//         let dep: string = r2[2];

//         if (!x.as_deps[as]) {
//           // error e281
//           ErrorsCollector.addError(
//             new AmError({
//               title: `no view reference found`,
//               message:
//                 `derived_table references field $\{${as}.${dep}\} but no View reference found ` +
//                 `for alias "${as}"`,
//               lines: [
//                 {
//                   line: x.derived_table_line_num,
//                   name: x.file,
//                   path: x.path
//                 }
//               ]
//             })
//           );
//           return;
//         } else {
//           x.as_deps[as].fields[dep] = 1;
//         }
//       }
//     }

//     newViews.push(x);
//   });
//   return newViews;
// }
