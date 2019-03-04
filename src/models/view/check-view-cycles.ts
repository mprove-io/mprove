import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

let Graph = require('graph.js/dist/graph.full.js'); // tslint:disable-line

export function checkViewCycles(item: { views: interfaces.View[] }) {
  let g = new Graph();

  item.views.forEach(x => {
    g.addVertex(x.name);

    if (x.as_deps && Object.keys(x.as_deps).length > 0) {
      Object.keys(x.as_deps).forEach(as => {
        g.createEdge(x.name, x.as_deps[as].view_name);
      });
    }
  });

  let cycledNames: string[] = [];

  if (g.hasCycle()) {
    cycledNames = g.cycle();

    let lines: interfaces.ErrorLine[] = [];

    cycledNames.forEach(cName => {
      let cycledView = item.views.find(v => v.name === cName);

      lines.push({
        line: cycledView.derived_table_line_num,
        name: cycledView.file,
        path: cycledView.path
      });
    });

    let cycledNamesString: string = cycledNames.join('", "');
    // error e285
    ErrorsCollector.addError(
      new AmError({
        title: `cycle in view references`,
        message: `Views "${cycledNamesString}" references each other by cycle.`,
        lines: lines
      })
    );
  }

  let newViews: interfaces.View[] = [];

  if (cycledNames.length > 0) {
    item.views.forEach(view => {
      if (cycledNames.indexOf(view.name) < 0) {
        newViews.push(view);
      }
    });
  }

  return cycledNames.length > 0 ? newViews : item.views;
}
