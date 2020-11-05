// import { AmError } from '../../barrels/am-error';
// import { ApRegex } from '../../barrels/am-regex';
// import { ErrorsCollector } from '../../barrels/errors-collector';

// export function checkTopValues(item: { filesAny: any[] }): any[] {
//   item.filesAny.forEach(file => {
//     Object.keys(file)
//       .filter(x => !x.toString().match(ApRegex.ENDS_WITH_LINE_NUM()))
//       .forEach(parameter => {
//         if (['path', 'ext', 'name'].indexOf(parameter) > -1) {
//           return;
//         }

//         if (
//           parameter === 'hidden' &&
//           !file[parameter].toString().match(ApRegex.TRUE_FALSE())
//         ) {
//           // error e119
//           ErrorsCollector.addError(
//             new AmError({
//               title: 'wrong hidden',
//               message: `parameter "hidden:" must be 'true' or 'false' if specified`,
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

//         if (
//           ['udf', 'view', 'model', 'dashboard'].indexOf(parameter) > -1 &&
//           file[parameter].toString().match(ApRegex.CAPTURE_SPECIAL_CHARS_G())
//         ) {
//           // error e275
//           ErrorsCollector.addError(
//             new AmError({
//               title: `wrong character in parameter's value`,
//               message: `parameter "${parameter}" contains wrong characters or whitespace`,
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
