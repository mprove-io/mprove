import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function upgradeJoinForceDims(item: { models: interfaces.Model[] }) {
  item.models.forEach(x => {
    x.joins.forEach(join => {
      join.view.fields.forEach(field => {
        if (field.field_class === enums.FieldClassEnum.Calculation) {
          field.force_dims = {};

          Object.keys(field.prep_force_dims).forEach(dimName => {
            if (!field.force_dims[join.as]) {
              field.force_dims[join.as] = {};
            }

            field.force_dims[join.as][dimName] = field.prep_force_dims[dimName];
          });
        }
      });
    });
  });

  return item.models;
}
