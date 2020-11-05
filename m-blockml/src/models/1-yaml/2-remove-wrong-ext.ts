// import { AmError } from '../../barrels/am-error';
// import { ApRegex } from '../../barrels/am-regex';
// import { ErrorsCollector } from '../../barrels/errors-collector';
// import { interfaces } from '../../barrels/interfaces';
// import { api } from '../../barrels/api';

// import { forEachSeries } from 'p-iteration';

// export async function removeWrongExt(item: {
//   files: api.File[];
// }): Promise<interfaces.File2[]> {
//   let file2s: interfaces.File2[] = [];

//   await forEachSeries(item.files, async (x: api.File) => {
//     let fp = {
//       path: x.path,
//       content: x.content
//     };

//     let reg = ApRegex.CAPTURE_EXT();
//     let r = reg.exec(x.name.toLowerCase());

//     let ext: any = r ? r[1] : ''; // any

//     if (['.udf', '.view', '.model', '.dashboard', '.md'].indexOf(ext) > -1) {
//       let f: interfaces.File2 = file2s.find(z => z.name === x.name);

//       if (f) {
//         f.filePaths.push(fp);
//       } else {
//         file2s.push({
//           name: x.name,
//           filePaths: [fp],
//           ext: ext
//         });
//       }
//     } else {
//       // error e1
//       ErrorsCollector.addError(
//         new AmError({
//           title: 'wrong file extension',
//           message:
//             'valid BlockML file extensions are: .udf .view .model .dashboard .md',
//           lines: [
//             {
//               line: 0,
//               name: x.name,
//               path: x.path
//             }
//           ]
//         })
//       );
//     }
//   });

//   return file2s;
// }
