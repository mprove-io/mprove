import { ApRegex } from '../../barrels/am-regex';
import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

const { forEach } = require('p-iteration');
let Graph = require('graph.js/dist/graph.full.js'); // tslint:disable-line

export async function processViewRefs(item: {
  views: interfaces.View[];
  udfs_dict: interfaces.UdfsDict;
  timezone: string;
  weekStart: api.ProjectWeekStartEnum;
  bqProject: string;
  projectId: string;
  structId: string;
}) {
  await forEach(item.views, async (x: interfaces.View) => {
    x.parts = {};

    x.derived_table_start = x.derived_table;

    if (Object.keys(x.as_deps).length === 0) {
      return;
    }

    let derivedTableNew = x.derived_table;

    derivedTableNew = this.substituteViewRefsRecursive({
      top_view: x,
      parent_view_name: x.name,
      parent_deps: {},
      input: derivedTableNew,
      views: item.views,
      udfs_dict: item.udfs_dict,
      timezone: item.timezone,
      weekStart: item.weekStart,
      bqProject: item.bqProject,
      projectId: item.projectId,
      structId: item.structId
    });

    // prepare text
    let text = x.derived_table;

    text = ApRegex.replaceViewRefs(text, x.name);
    text = ApRegex.removeBracketsOnViewFieldRefs(text);

    x.derived_table_start = text;

    // sort parts
    let partNamesSorted: string[] = [];

    let g = new Graph();

    Object.keys(x.parts).forEach(viewPartName => {
      g.addVertex(viewPartName);

      Object.keys(x.parts[viewPartName].deps).forEach(dep => {
        g.createEdge(viewPartName, dep);
      });
    });

    for (let [key, value] of g.vertices_topologically()) {
      // iterates over all vertices of the graph in topological order
      partNamesSorted.unshift(key);
    }

    // unshift parts to text
    let count = 0;

    partNamesSorted.reverse().forEach(viewPartName => {
      count++;

      let content = x.parts[viewPartName].content;
      content = ApRegex.replaceViewRefs(
        content,
        x.parts[viewPartName].parent_view_name
      );
      content = ApRegex.removeBracketsOnViewFieldRefs(content);

      x.parts[viewPartName].content_prepared = content;

      if (count === 1) {
        // remove last comma
        content = content.slice(0, -1);
      }

      text = [content, text].join(`\n`);
    });

    // wrap with
    text = [`WITH`, text].join(`\n`);

    x.derived_table_new = text;
  });

  return item.views;
}
