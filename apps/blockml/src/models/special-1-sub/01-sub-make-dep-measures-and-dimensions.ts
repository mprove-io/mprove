import { common } from '~blockml/barrels/common';

let func = common.FuncEnum.SubMakeDepMeasuresAndDimensions;

export function subMakeDepMeasuresAndDimensions(item: {
  select: common.VarsSub['select'];
  varsSubSteps: common.FileViewPart['varsSubSteps'];
  view: common.FileView;
}) {
  let { select, varsSubSteps, view } = item;

  let varsInput = common.makeCopy<common.VarsSub>({ select });

  let depMeasures: common.VarsSub['depMeasures'] = {};
  let depDimensions: common.VarsSub['depDimensions'] = {};

  select.forEach(fieldName => {
    let field = view.fields.find(vField => vField.name === fieldName);

    if (field.fieldClass !== common.FieldClassEnum.Calculation) {
      return;
    }

    Object.keys(view.fieldsDepsAfterSingles[fieldName]).forEach(depName => {
      let depViewField = view.fields.find(vField => vField.name === depName);

      if (depViewField.fieldClass === common.FieldClassEnum.Measure) {
        depMeasures[depName] = 1;
      }

      if (depViewField.fieldClass === common.FieldClassEnum.Dimension) {
        depDimensions[depName] = 1;
      }
    });
  });

  let varsOutput: common.VarsSub = { depMeasures, depDimensions };

  varsSubSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
