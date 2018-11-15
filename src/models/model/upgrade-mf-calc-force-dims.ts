import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function upgradeMfCalcForceDims(item: { models: interfaces.Model[] }) {
  item.models.forEach(x => {
    x.fields.forEach(f => {
      if (f.field_class === enums.FieldClassEnum.Calculation) {
        f.force_dims = {};

        Object.keys(f.prep_force_dims).forEach(dimName => {
          if (f.force_dims['mf']) {
            f.force_dims['mf'][dimName] = f.prep_force_dims[dimName];
          } else {
            f.force_dims['mf'] = {
              [dimName]: f.prep_force_dims[dimName]
            };
          }
        });
      }
    });
  });

  return item.models;
}
