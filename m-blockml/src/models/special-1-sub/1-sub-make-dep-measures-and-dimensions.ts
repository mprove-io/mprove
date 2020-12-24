import { interfaces } from '../../barrels/interfaces';
import { api } from '../../barrels/api';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';

let func = enums.FuncEnum.SubMakeDepMeasuresAndDimensions;

export function subMakeDepMeasuresAndDimensions(item: {
  select: interfaces.VarsSub['select'];
  varsSubSteps: interfaces.ViewPart['varsSubSteps'];
  view: interfaces.View;
}) {
  let { select, varsSubSteps, view } = item;

  let varsInput: interfaces.VarsSub = helper.makeCopy({ select });

  let depMeasures: interfaces.VarsSub['depMeasures'] = {};
  let depDimensions: interfaces.VarsSub['depDimensions'] = {};

  select.forEach(fieldName => {
    // in view fields - calculations and measures can have fieldsDepsAfterSingles
    // we interested in calculation class now

    // TODO: check that we don't need dep dimensions of found measures (test v__1)
    let field = view.fields.find(vField => vField.name === fieldName);

    if (field.fieldClass === api.FieldClassEnum.Calculation) {
      Object.keys(view.fieldsDepsAfterSingles[fieldName]).forEach(depName => {
        let depViewField = view.fields.find(vField => vField.name === depName);

        if (depViewField.fieldClass === api.FieldClassEnum.Measure) {
          depMeasures[depName] = 1;
        }

        if (depViewField.fieldClass === api.FieldClassEnum.Dimension) {
          depDimensions[depName] = 1;
        }
      });
    }
  });

  let varsOutput: interfaces.VarsSub = { depMeasures, depDimensions };

  varsSubSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
