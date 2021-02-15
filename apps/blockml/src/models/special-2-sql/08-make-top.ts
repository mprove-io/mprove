import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';

let toposort = require('toposort');

let func = enums.FuncEnum.MakeTop;

export function makeTop(item: {
  mainUdfs: interfaces.VarsSql['mainUdfs'];
  withParts: interfaces.VarsSql['withParts'];
  withDerivedTables: interfaces.VarsSql['withDerivedTables'];
  withViews: interfaces.VarsSql['withViews'];
  varsSqlSteps: interfaces.Report['varsSqlSteps'];
  model: interfaces.Model;
  udfsDict: common.UdfsDict;
}) {
  let {
    mainUdfs,
    withParts,
    withDerivedTables,
    withViews,
    varsSqlSteps,
    model,
    udfsDict
  } = item;

  let varsInput = common.makeCopy<interfaces.VarsSql>({
    mainUdfs,
    withParts,
    withDerivedTables,
    withViews
  });

  let top: interfaces.VarsSql['top'] = [];

  if (model.connection.type === common.ConnectionTypeEnum.BigQuery) {
    top.push(`${constants.STANDARD_SQL}`);
  }

  // adding model level udfs to main udfs
  if (common.isDefined(model.udfs)) {
    model.udfs.forEach(udf => {
      mainUdfs[udf] = 1;
    });
  }

  // extracting main udfs
  Object.keys(mainUdfs).forEach(udf => {
    top = top.concat(udfsDict[udf].split('\n'));
  });

  top.push(`${constants.WITH}`);

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

    top = top.concat(text);
  }

  top = top.concat(withDerivedTables);
  top = top.concat(withViews);

  let varsOutput: interfaces.VarsSql = { top };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
