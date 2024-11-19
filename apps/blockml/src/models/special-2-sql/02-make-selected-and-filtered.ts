import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';

let func = common.FuncEnum.MakeSelectedAndFiltered;

export function makeSelectedAndFiltered(item: {
  select: common.VarsSql['select'];
  depMeasures: common.VarsSql['depMeasures'];
  depDimensions: common.VarsSql['depDimensions'];
  filters: common.VarsSql['filters'];
  varsSqlSteps: common.FilePartTile['varsSqlSteps'];
  model: common.FileModel;
}) {
  let { select, depMeasures, depDimensions, filters, varsSqlSteps, model } =
    item;

  let varsInput = common.makeCopy<common.VarsSql>({
    select,
    filters,
    depMeasures,
    depDimensions
  });

  let selected: common.VarsSql['selected'] = {};
  let filtered: common.VarsSql['filtered'] = {};

  let i = 0;

  select.forEach(element => {
    let reg = common.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G();
    let r = reg.exec(element);

    let asName = r[1];
    let fieldName = r[2];

    selected[element] = { asName: asName, fieldName: fieldName };
  });

  Object.keys(depMeasures).forEach(asName => {
    Object.keys(depMeasures[asName]).forEach(fieldName => {
      let element = `${asName}.${fieldName}`;
      selected[element] = { asName: asName, fieldName: fieldName };
    });
  });

  Object.keys(depDimensions).forEach(asName => {
    Object.keys(depDimensions[asName]).forEach(fieldName => {
      let element = `${asName}.${fieldName}`;
      selected[element] = { asName: asName, fieldName: fieldName };
    });
  });

  Object.keys(filters)
    .sort((a, b) => (a > b ? 1 : b > a ? -1 : 0))
    .forEach(element => {
      let reg = common.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G();
      let r = reg.exec(element);

      let asName = r[1];
      let fieldName = r[2];

      let fieldClass: common.FieldClassEnum =
        asName === constants.MF
          ? model.fields.find(mField => mField.name === fieldName).fieldClass
          : model.joins
              .find(j => j.as === asName)
              .view.fields.find(vField => vField.name === fieldName).fieldClass;

      filtered[element] = { asName: asName, fieldName: fieldName };

      if (fieldClass === common.FieldClassEnum.Measure) {
        selected[element] = { asName: asName, fieldName: fieldName };
      }
    });

  let varsOutput: common.VarsSql = {
    selected,
    filtered
  };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
