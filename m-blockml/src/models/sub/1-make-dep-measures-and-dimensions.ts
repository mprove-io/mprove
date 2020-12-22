import { interfaces } from '../../barrels/interfaces';
import { api } from '../../barrels/api';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';

let func = enums.FuncEnum.MakeDepMeasuresAndDimensions;

export function makeDepMeasuresAndDimensions(item: {
  select: interfaces.VarsSub['select'];
  view: interfaces.VarsSub['view'];
  views: interfaces.View[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { select, view, structId, caller } = item;

  Object.assign(item.view.varsSub, { select });

  helper.log(caller, func, structId, enums.LogTypeEnum.SubStart, item.views);

  let depMeasures: interfaces.VarsSub['depMeasures'] = {};
  let depDimensions: interfaces.VarsSub['depDimensions'] = {};

  select.forEach(fieldName => {
    // in view fields - calculations and measures can have fieldsDepsAfterSingles
    // we interested in calculation class now
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

  let output = { depMeasures, depDimensions };
  Object.assign(item.view.varsSub, output);

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Views, item.views);

  return output;
}
