import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';
import { constants } from '../../barrels/constants';
import { applyFilter } from './apply-filter';
import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';

let toposort = require('toposort');

let func = enums.FuncEnum.ComposeMain;

export function composeMain(item: {
  mainUdfs: interfaces.VarsSql['mainUdfs'];
  withParts: interfaces.VarsSql['withParts'];
  myWith: interfaces.VarsSql['myWith'];
  mainText: interfaces.VarsSql['mainText'];
  contents: interfaces.VarsSql['contents'];
  whereMain: interfaces.VarsSql['whereMain'];
  joinsWhere: interfaces.VarsSql['joinsWhere'];
  groupMainBy: interfaces.VarsSql['groupMainBy'];
  havingMain: interfaces.VarsSql['havingMain'];
  udfsDict: api.UdfsDict;
  varsSqlSteps: interfaces.Report['varsSqlSteps'];
  model: interfaces.Model;
}) {
  let {
    mainUdfs,
    udfsDict,
    withParts,
    myWith,
    mainText,
    contents,
    whereMain,
    joinsWhere,
    groupMainBy,
    havingMain,
    varsSqlSteps,
    model
  } = item;

  let varsInput: interfaces.VarsSql = helper.makeCopy({
    mainUdfs,
    udfsDict,
    withParts,
    myWith,
    mainText,
    contents,
    whereMain,
    joinsWhere,
    groupMainBy,
    havingMain
  });

  let mainQuery: interfaces.VarsSql['mainQuery'] = [];

  if (model.connection.type === api.ConnectionTypeEnum.BigQuery) {
    mainQuery.push(`${constants.STANDARD_SQL}`);
  }

  // adding model level udfs to main udfs
  if (helper.isDefined(model.udfs)) {
    model.udfs.forEach(udf => {
      mainUdfs[udf] = 1;
    });
  }

  // extracting main udfs
  Object.keys(mainUdfs).forEach(udf => {
    mainQuery.push(udfsDict[udf]);
  });

  mainQuery.push(`${constants.WITH}`);

  if (Object.keys(withParts).length > 0) {
    let partNamesSorted: string[] = [];

    let graph = [];
    let zeroDepsViewPartNames = [];

    Object.keys(withParts).forEach(viewPartName => {
      Object.keys(withParts[viewPartName].deps).forEach(dep => {
        graph.push([viewPartName, dep]);
      });
    });

    partNamesSorted = toposort(graph).reverse();

    Object.keys(withParts).forEach(viewPartName => {
      if (partNamesSorted.indexOf(viewPartName) < 0) {
        zeroDepsViewPartNames.push(viewPartName);
      }
    });

    partNamesSorted = [...zeroDepsViewPartNames, ...partNamesSorted];

    let text: string[] = [];

    partNamesSorted.forEach(viewPartName => {
      text = text.concat(withParts[viewPartName].sub);
    });

    // text = text.slice(0, -1);

    mainQuery = mainQuery.concat(text);
  }

  mainQuery = mainQuery.concat(myWith);

  mainQuery.push(`  ${constants.MODEL_MAIN} AS (`);
  mainQuery.push(`    ${constants.SELECT}`);

  if (mainText.length === 0) {
    mainQuery.push(`    1 as ${constants.NO_FIELDS_SELECTED},`);
  }

  mainQuery = mainQuery.concat(mainText.map(s => `    ${s}`));

  // chop
  mainQuery[mainQuery.length - 1] = mainQuery[mainQuery.length - 1].slice(
    0,
    -1
  );

  mainQuery = mainQuery.concat(contents.map(s => `    ${s}`));

  let whereMainLength = 0;

  Object.keys(whereMain).forEach(s => {
    whereMainLength = whereMainLength + whereMain[s].length;
  });

  if (
    joinsWhere.length > 0 ||
    whereMainLength > 0 ||
    helper.isDefined(model.sqlAlwaysWhereReal)
  ) {
    mainQuery.push(`    ${constants.WHERE}`);

    if (joinsWhere.length > 0) {
      joinsWhere.forEach(element => {
        element = applyFilter(item, constants.MF, element);

        mainQuery.push(`    ${element}`);
      });
    }

    if (helper.isDefined(model.sqlAlwaysWhereReal)) {
      // remove ${ } on doubles (no singles exists in _real of sql_always_where)
      // ${a.city} + ${b.country}   >>>   a.city + b.country

      let sqlAlwaysWhereFinal = api.MyRegex.removeBracketsOnDoubles(
        model.sqlAlwaysWhereReal
      );

      sqlAlwaysWhereFinal = applyFilter(
        item,
        constants.MF,
        sqlAlwaysWhereFinal
      );

      mainQuery.push(`      (${sqlAlwaysWhereFinal})`);
      mainQuery.push(`     ${constants.AND}`);
    }

    Object.keys(whereMain).forEach(element => {
      if (whereMain[element].length > 0) {
        mainQuery = mainQuery.concat(whereMain[element].map(s => `    ${s}`));
        mainQuery.push(`     ${constants.AND}`);
      }
    });

    mainQuery.pop();
    mainQuery.push(constants.EMPTY_STRING);
  }

  if (groupMainBy.length > 0) {
    let groupMainByString = groupMainBy.join(', ');

    mainQuery.push(`    ${constants.GROUP_BY} ${groupMainByString}`);
    mainQuery.push(constants.EMPTY_STRING);
  }

  if (Object.keys(havingMain).length > 0) {
    mainQuery.push(`    ${constants.HAVING}`);

    Object.keys(havingMain).forEach(element => {
      if (havingMain[element].length > 0) {
        mainQuery = mainQuery.concat(havingMain[element]);
        mainQuery.push(`     ${constants.AND}`);
      }
    });

    mainQuery.pop();
    mainQuery.push(constants.EMPTY_STRING);
  }

  mainQuery.pop();
  mainQuery.push('  )');

  // TODO: check apply_filter 'undefined as undefined'
  mainQuery = mainQuery.map(x =>
    x.includes('undefined as undefined') ? '--' + x : x
  );

  let varsOutput: interfaces.VarsSql = { mainQuery };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
