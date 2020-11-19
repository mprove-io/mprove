// import { interfaces } from '../../barrels/interfaces';

// let Graph = require('graph.js/dist/graph.full.js'); // tslint:disable-line

// export function sortPdts(item: { pdts: interfaces.Pdt[] }) {
//   let pdtsSorted: string[] = [];

//   let g = new Graph();

//   item.pdts.forEach(x => {
//     g.addVertex(x.name);

//     x.pdt_deps.forEach(dep => {
//       g.createEdge(x.name, dep);
//     });
//   });

//   for (let [key, value] of g.vertices_topologically()) {
//     // iterates over all vertices of the graph in topological order
//     pdtsSorted.unshift(key);
//   }

//   return pdtsSorted;
// }
