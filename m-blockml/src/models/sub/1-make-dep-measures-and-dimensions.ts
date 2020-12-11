import { interfaces } from '../../barrels/interfaces';
import { api } from '../../barrels/api';

export function makeDepMeasuresAndDimensions(item: interfaces.VarsSub) {
  let depMeasures: { [dep: string]: number } = {};
  let depDimensions: { [dep: string]: number } = {};

  item.select.forEach(fieldName => {
    // in view fields - calculations and measures can have fieldsDepsAfterSingles
    // we interested in calculation class now
    let field = item.view.fields.find(vField => vField.name === fieldName);

    if (field.fieldClass === api.FieldClassEnum.Calculation) {
      Object.keys(item.view.fieldsDepsAfterSingles[fieldName]).forEach(
        depName => {
          let depViewField = item.view.fields.find(
            vField => vField.name === depName
          );

          if (depViewField.fieldClass === api.FieldClassEnum.Measure) {
            depMeasures[depName] = 1;
          }

          if (depViewField.fieldClass === api.FieldClassEnum.Dimension) {
            depDimensions[depName] = 1;
          }
        }
      );
    }
  });

  item.depMeasures = depMeasures;
  item.depDimensions = depDimensions;

  return item;
}
