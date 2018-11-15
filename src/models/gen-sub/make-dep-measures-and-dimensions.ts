import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function makeDepMeasuresAndDimensions(item: interfaces.VarsSub) {
  let depMeasures: { [dep: string]: number } = {};
  let depDimensions: { [dep: string]: number } = {};

  item.select.forEach(fieldName => {
    // in view fields - calculations and measures can have fields_deps_after_singles
    // we interested in calculation class now
    let field = item.view.fields.find(vField => vField.name === fieldName);

    if (field.field_class === enums.FieldClassEnum.Calculation) {
      Object.keys(item.view.fields_deps_after_singles[fieldName]).forEach(
        depName => {
          let depViewField = item.view.fields.find(
            vField => vField.name === depName
          );

          if (depViewField.field_class === enums.FieldClassEnum.Measure) {
            depMeasures[depName] = 1;
          }

          if (depViewField.field_class === enums.FieldClassEnum.Dimension) {
            depDimensions[depName] = 1;
          }
        }
      );
    }
  });

  item.dep_measures = depMeasures;
  item.dep_dimensions = depDimensions;

  return item;
}
