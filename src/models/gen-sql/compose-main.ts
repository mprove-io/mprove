import { ApRegex } from '../../barrels/am-regex';
import { interfaces } from '../../barrels/interfaces';

let Graph = require('graph.js/dist/graph.full.js'); // tslint:disable-line

export function composeMain(item: interfaces.Vars) {
  let main: string[] = [];

  main.push(`#standardSQL`);

  // adding model level udfs to main udfs
  if (typeof item.model.udfs !== 'undefined' && item.model.udfs !== null) {
    item.model.udfs.forEach(udf => {
      item.main_udfs[udf] = 1;
    });
  }

  // extracting main udfs
  Object.keys(item.main_udfs).forEach(udf => {
    main.push(item.udfs_dict[udf]);
  });

  main.push(`WITH`);

  if (Object.keys(item.with_parts).length > 0) {
    // sort parts
    let partNamesSorted: string[] = [];

    let g = new Graph();

    Object.keys(item.with_parts).forEach(viewPartName => {
      g.addVertex(viewPartName);

      Object.keys(item.with_parts[viewPartName].deps).forEach(dep => {
        g.createEdge(viewPartName, dep);
      });
    });

    for (let [key, value] of g.vertices_topologically()) {
      // iterates over all vertices of the graph in topological order
      partNamesSorted.unshift(key);
    }

    // unshift parts to text

    let text: string = ``;

    partNamesSorted.reverse().forEach(viewPartName => {
      let contentPrepared = item.with_parts[viewPartName].content_prepared;

      text = [contentPrepared + `\n`, text].join(`\n`);
    });

    text = text.slice(0, -1);

    main = main.concat(text);
  }

  main = main.concat(item.with);

  main.push(`  model_main AS (`);
  main.push(`    SELECT`);

  if (item.main_text.length === 0) {
    main.push(`    1 as no_fields_selected,`);
  }

  main = main.concat(item.main_text.map(s => `    ${s}`));

  // chop
  main[main.length - 1] = main[main.length - 1].slice(0, -1);

  main = main.concat(item.contents.map(s => `    ${s}`));

  let whereMainLength: number = 0;

  Object.keys(item.where_main).forEach(s => {
    whereMainLength = whereMainLength + item.where_main[s].length;
  });

  if (
    item.joins_where.length > 0 ||
    whereMainLength > 0 ||
    (typeof item.model.sql_always_where_real !== 'undefined' &&
      item.model.sql_always_where_real !== null)
  ) {
    main.push(`    WHERE`);

    if (item.joins_where.length > 0) {
      item.joins_where.forEach(element => {
        element = this.applyFilter(item, 'mf', element);

        main.push(`    ${element}`);
      });
    }

    if (
      typeof item.model.sql_always_where_real !== 'undefined' &&
      item.model.sql_always_where_real !== null
    ) {
      // remove ${ } on doubles (no singles exists in _real of sql_always_where)
      // ${a.city} + ${b.country}   >>>   a.city + b.country

      let sqlAlwaysWhereFinal = ApRegex.removeBracketsOnDoubles(
        item.model.sql_always_where_real
      );

      sqlAlwaysWhereFinal = this.applyFilter(item, 'mf', sqlAlwaysWhereFinal);

      main.push(`      (${sqlAlwaysWhereFinal})`);
      main.push(`     AND`);
    }

    Object.keys(item.where_main).forEach(element => {
      if (item.where_main[element].length > 0) {
        main = main.concat(item.where_main[element].map(s => `    ${s}`));
        main.push(`     AND`);
      }
    });

    main.pop();
    main.push(``);
  }

  if (item.group_main_by.length > 0) {
    let groupMainByString = item.group_main_by.join(`, `);

    main.push(`    GROUP BY ${groupMainByString}`);
    main.push(``);
  }

  if (Object.keys(item.having_main).length > 0) {
    main.push(`    HAVING`);

    Object.keys(item.having_main).forEach(element => {
      if (item.having_main[element].length > 0) {
        main = main.concat(item.having_main[element]);
        main.push(`     AND`);
      }
    });

    main.pop();
    main.push(``);
  }

  main.pop();
  main.push(`  )`);

  item.query = main;

  return item;
}
