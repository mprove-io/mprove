import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';

let toposort = require('toposort');

let func = common.FuncEnum.MakeTop;

export function makeTop(item: {
  mainUdfs: common.VarsSql['mainUdfs'];
  withParts: common.VarsSql['withParts'];
  withDerivedTables: common.VarsSql['withDerivedTables'];
  withViews: common.VarsSql['withViews'];
  varsSqlSteps: common.FilePartReport['varsSqlSteps'];
  model: common.FileModel;
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

  let varsInput = common.makeCopy<common.VarsSql>({
    mainUdfs,
    withParts,
    withDerivedTables,
    withViews
  });

  let top: common.VarsSql['top'] = [];

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

    let graph: any[] = [];
    let zeroDepsViewPartNames: any[] = [];

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

  let varsOutput: common.VarsSql = { top };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
