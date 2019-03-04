import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

let Graph = require('graph.js/dist/graph.full.js'); // tslint:disable-line

export function checkJoinsCyclesAndToposort(item: { models: interfaces.Model[] }) {

  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {

    let g = new Graph();

    Object.keys(x.joins_prepared_deps).forEach(alias => {

      g.addVertex(alias);

      Object.keys(x.joins_prepared_deps[alias]).forEach(as => {
        g.createEdge(alias, as);
      });
    });

    if (g.hasCycle()) {
      let cycledNames: string[] = g.cycle();

      let lines: interfaces.ErrorLine[] = [];

      cycledNames.forEach(cName => {

        let cycledJoin = x.joins.find(j => j.as === cName);

        lines.push({
          line: cycledJoin.sql_on_line_num,
          name: x.file,
          path: x.path,
        });
      });

      let cycledNamesString: string = cycledNames.join('", "');
      // error e56
      ErrorsCollector.addError(new AmError({
        title: `cycle in sql_on references`,
        message: `Joins "${cycledNamesString}" references each other by cycle.`,
        lines: lines,
      }));
      return;

    } else { // not cyclic

      let sorted: any = [];

      for (let [key, value] of g.vertices_topologically()) {
        // iterates over all vertices of the graph in topological order
        sorted.unshift(key);
      }

      x.joins_sorted = [x.from_as, ...sorted];
    }

    newModels.push(x);
  });

  return newModels;
}
