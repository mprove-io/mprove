import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { api } from '../../barrels/api';
import { constants } from '../../barrels/constants';

let toposort = require('toposort');

let func = enums.FuncEnum.MakeTop;

export function makeTop(item: {
  mainUdfs: interfaces.VarsSql['mainUdfs'];
  withParts: interfaces.VarsSql['withParts'];
  myWith: interfaces.VarsSql['myWith'];
  varsSqlSteps: interfaces.Report['varsSqlSteps'];
  model: interfaces.Model;
  udfsDict: api.UdfsDict;
}) {
  let { mainUdfs, withParts, myWith, varsSqlSteps, model, udfsDict } = item;

  let varsInput = helper.makeCopy<interfaces.VarsSql>({
    mainUdfs,
    withParts,
    myWith
  });

  let top: interfaces.VarsSql['top'] = [];

  if (model.connection.type === api.ConnectionTypeEnum.BigQuery) {
    top.push(`${constants.STANDARD_SQL}`);
  }

  // adding model level udfs to main udfs
  if (helper.isDefined(model.udfs)) {
    model.udfs.forEach(udf => {
      mainUdfs[udf] = 1;
    });
  }

  // extracting main udfs
  Object.keys(mainUdfs).forEach(udf => {
    top.push(udfsDict[udf]);
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

  top = top.concat(myWith);

  let varsOutput: interfaces.VarsSql = { top };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
