// import { AmError } from '../../barrels/am-error';
// import { ErrorsCollector } from '../../barrels/errors-collector';
// import { interfaces } from '../../barrels/interfaces';

// let Graph = require('graph.js/dist/graph.full.js'); // tslint:disable-line

// export function checkCycles<
//   T extends interfaces.View | interfaces.Model
// >(item: { entities: Array<T> }): Array<T> {
//   let newEntities: T[] = [];

//   item.entities.forEach(x => {
//     let g = new Graph();
//     Object.keys(x.fields_deps).forEach(fieldName => {
//       Object.keys(x.fields_deps[fieldName]).forEach(depName => {
//         g.createEdge(fieldName, depName);
//       });
//     });

//     if (g.hasCycle()) {
//       let cycledNames: string[] = g.cycle();

//       let lines: interfaces.ErrorLine[] = [];

//       cycledNames.forEach(cName => {
//         if (x.fields_deps[cName]) {
//           Object.keys(x.fields_deps[cName]).forEach(dName => {
//             if (cycledNames.indexOf(dName) > -1) {
//               lines.push({
//                 line: x.fields_deps[cName][dName],
//                 name: x.file,
//                 path: x.path
//               });
//             }
//           });
//         }
//       });

//       let cycledNamesString: string = cycledNames.join('", "');
//       // error e34
//       ErrorsCollector.addError(
//         new AmError({
//           title: `cycle in references`,
//           message: `fields "${cycledNamesString}" references each other by cycle`,
//           lines: lines
//         })
//       );
//       return;
//     }

//     newEntities.push(x);
//   });

//   return newEntities;
// }
