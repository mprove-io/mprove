import { api } from '~blockml/barrels/api';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';

let func = enums.FuncEnum.SubMakeDepMeasuresAndDimensions;

export function subMakeDepMeasuresAndDimensions(item: {
  select: interfaces.VarsSub['select'];
  varsSubSteps: interfaces.ViewPart['varsSubSteps'];
  view: interfaces.View;
}) {
  let { select, varsSubSteps, view } = item;

  let varsInput = helper.makeCopy<interfaces.VarsSub>({ select });

  let depMeasures: interfaces.VarsSub['depMeasures'] = {};
  let depDimensions: interfaces.VarsSub['depDimensions'] = {};

  select.forEach(fieldName => {
    let field = view.fields.find(vField => vField.name === fieldName);

    if (field.fieldClass !== api.FieldClassEnum.Calculation) {
      return;
    }

    Object.keys(view.fieldsDepsAfterSingles[fieldName]).forEach(depName => {
      let depViewField = view.fields.find(vField => vField.name === depName);

      if (depViewField.fieldClass === api.FieldClassEnum.Measure) {
        depMeasures[depName] = 1;
      }

      if (depViewField.fieldClass === api.FieldClassEnum.Dimension) {
        depDimensions[depName] = 1;
      }
    });
  });

  let varsOutput: interfaces.VarsSub = { depMeasures, depDimensions };

  varsSubSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
