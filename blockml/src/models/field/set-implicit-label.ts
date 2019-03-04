import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function setImplicitLabel<
  T extends interfaces.View | interfaces.Model | interfaces.Dashboard
>(item: { entities: Array<T> }): Array<T> {
  item.entities.forEach((x: T) => {
    x.fields.forEach(field => {
      if (
        (typeof field.label === 'undefined' || field.label === null) &&
        field.field_class !== enums.FieldClassEnum.Time
      ) {
        field.label = field.name;
        field.label_line_num = 0;
      }
    });
  });
  return item.entities;
}
