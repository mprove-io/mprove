import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';

let func = enums.FuncEnum.SubMakeDepMeasuresAndDimensions;

export function subMakeDepMeasuresAndDimensions(item: {
  select: interfaces.VarsSub['select'];
  varsSubSteps: interfaces.ViewPart['varsSubSteps'];
  view: interfaces.View;
}) {
  let { select, varsSubSteps, view } = item;

  let varsInput = common.makeCopy<interfaces.VarsSub>({ select });

  let depMeasures: interfaces.VarsSub['depMeasures'] = {};
  let depDimensions: interfaces.VarsSub['depDimensions'] = {};

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

  let varsOutput: interfaces.VarsSub = { depMeasures, depDimensions };

  varsSubSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
