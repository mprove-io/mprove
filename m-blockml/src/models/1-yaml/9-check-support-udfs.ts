// import { api } from '../../barrels/api';
// import { BmError } from '../bm-error';

// export function checkSupportUdfs(item: {
//   filesAny: any[];
//   connections: api.ProjectConnection[];
//   errors: BmError[];
//   structId: string;
// }): any[] {
//   item.filesAny.forEach(file => {
//     Object.keys(file)
//       .filter(x => !x.toString().match(api.MyRegex.ENDS_WITH_LINE_NUM()))
//       .forEach(parameter => {
//         if (
//           ['.view', '.model'].indexOf(file.ext) > -1 &&
//           parameter === 'udfs'
//         ) {
//           if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
//             // error e296
//             ErrorsCollector.addError(
//               new AmError({
//                 title: `UDFs are not supported for ${api.ProjectConnectionEnum.PostgreSQL}`,
//                 message: `parameter "${parameter}" is useless`,
//                 lines: [
//                   {
//                     line: file[parameter + '_line_num'],
//                     name: file.name,
//                     path: file.path
//                   }
//                 ]
//               })
//             );

//             delete file[parameter];
//             delete file[parameter + '_line_num'];
//             return;
//           }

//           if (['.udf'].indexOf(file.ext) > -1 && parameter === 'udf') {
//             // error e297
//             ErrorsCollector.addError(
//               new AmError({
//                 title: `UDFs are not supported for ${api.ProjectConnectionEnum.PostgreSQL}`,
//                 message: '.udf files are useless',
//                 lines: [
//                   {
//                     line: file[parameter + '_line_num'],
//                     name: file.name,
//                     path: file.path
//                   }
//                 ]
//               })
//             );
//           }

//           delete file[parameter];
//           delete file[parameter + '_line_num'];
//           return;
//         }
//       });
//   });
//   return item.filesAny;
// }
