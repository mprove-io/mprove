import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';
import { applyFilter } from './apply-filter';
import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';

let toposort = require('toposort');

export function composeMain(item: interfaces.VarsSql) {
  let main: string[] = [];

  if (item.model.connection.type === api.ConnectionTypeEnum.BigQuery) {
    main.push(`${constants.STANDARD_SQL}`);
  }

  // adding model level udfs to main udfs
  if (helper.isDefined(item.model.udfs)) {
    item.model.udfs.forEach(udf => {
      item.mainUdfs[udf] = 1;
    });
  }

  // extracting main udfs
  Object.keys(item.mainUdfs).forEach(udf => {
    main.push(item.udfsDict[udf]);
  });

  main.push(`${constants.WITH}`);

  if (Object.keys(item.withParts).length > 0) {
    let partNamesSorted: string[] = [];

    let graph = [];
    let zeroDepsViewPartNames = [];

    Object.keys(item.withParts).forEach(viewPartName => {
      Object.keys(item.withParts[viewPartName].deps).forEach(dep => {
        graph.push([viewPartName, dep]);
      });
    });

    partNamesSorted = toposort(graph).reverse();

    Object.keys(item.withParts).forEach(viewPartName => {
      if (partNamesSorted.indexOf(viewPartName) < 0) {
        zeroDepsViewPartNames.push(viewPartName);
      }
    });

    partNamesSorted = [...zeroDepsViewPartNames, ...partNamesSorted];

    let text = constants.EMPTY_STRING;

    partNamesSorted.forEach(viewPartName => {
      text = [text, item.withParts[viewPartName].contentPrepared + '\n'].join(
        '\n'
      );
    });

    text = text.slice(0, -1);

    main = main.concat(text);
  }

  main = main.concat(item.with);

  main.push(`  ${constants.MODEL_MAIN} AS (`);
  main.push(`    ${constants.SELECT}`);

  if (item.mainText.length === 0) {
    main.push(`    1 as ${constants.NO_FIELDS_SELECTED},`);
  }

  main = main.concat(item.mainText.map(s => `    ${s}`));

  // chop
  main[main.length - 1] = main[main.length - 1].slice(0, -1);

  main = main.concat(item.contents.map(s => `    ${s}`));

  let whereMainLength = 0;

  Object.keys(item.whereMain).forEach(s => {
    whereMainLength = whereMainLength + item.whereMain[s].length;
  });

  if (
    item.joinsWhere.length > 0 ||
    whereMainLength > 0 ||
    helper.isDefined(item.model.sqlAlwaysWhereReal)
  ) {
    main.push(`    ${constants.WHERE}`);

    if (item.joinsWhere.length > 0) {
      item.joinsWhere.forEach(element => {
        element = applyFilter(item, constants.MF, element);

        main.push(`    ${element}`);
      });
    }

    if (helper.isDefined(item.model.sqlAlwaysWhereReal)) {
      // remove ${ } on doubles (no singles exists in _real of sql_always_where)
      // ${a.city} + ${b.country}   >>>   a.city + b.country

      let sqlAlwaysWhereFinal = api.MyRegex.removeBracketsOnDoubles(
        item.model.sqlAlwaysWhereReal
      );

      sqlAlwaysWhereFinal = applyFilter(
        item,
        constants.MF,
        sqlAlwaysWhereFinal
      );

      main.push(`      (${sqlAlwaysWhereFinal})`);
      main.push(`     ${constants.AND}`);
    }

    Object.keys(item.whereMain).forEach(element => {
      if (item.whereMain[element].length > 0) {
        main = main.concat(item.whereMain[element].map(s => `    ${s}`));
        main.push(`     ${constants.AND}`);
      }
    });

    main.pop();
    main.push(constants.EMPTY_STRING);
  }

  if (item.groupMainBy.length > 0) {
    let groupMainByString = item.groupMainBy.join(', ');

    main.push(`    ${constants.GROUP_BY} ${groupMainByString}`);
    main.push(constants.EMPTY_STRING);
  }

  if (Object.keys(item.havingMain).length > 0) {
    main.push(`    ${constants.HAVING}`);

    Object.keys(item.havingMain).forEach(element => {
      if (item.havingMain[element].length > 0) {
        main = main.concat(item.havingMain[element]);
        main.push(`     ${constants.AND}`);
      }
    });

    main.pop();
    main.push(constants.EMPTY_STRING);
  }

  main.pop();
  main.push('  )');

  // TODO: check apply_filter 'undefined as undefined'
  main = main.map(x => (x.includes('undefined as undefined') ? '--' + x : x));

  item.query = main;

  return item;
}
