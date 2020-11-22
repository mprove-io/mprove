import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function makeDepMeasuresAndDimensions(item: interfaces.VarsSub) {
  let depMeasures: { [dep: string]: number } = {};
  let depDimensions: { [dep: string]: number } = {};

  item.select.forEach(fieldName => {
    // in view fields - calculations and measures can have fieldsDepsAfterSingles
    // we interested in calculation class now
    let field = item.view.fields.find(vField => vField.name === fieldName);

    if (field.fieldClass === enums.FieldClassEnum.Calculation) {
      Object.keys(item.view.fieldsDepsAfterSingles[fieldName]).forEach(
        depName => {
          let depViewField = item.view.fields.find(
            vField => vField.name === depName
          );

          if (depViewField.fieldClass === enums.FieldClassEnum.Measure) {
            depMeasures[depName] = 1;
          }

          if (depViewField.fieldClass === enums.FieldClassEnum.Dimension) {
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
