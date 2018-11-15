import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function transformYesNoDimensions<
  T extends interfaces.View | interfaces.Model
>(item: { entities: Array<T> }): Array<T> {
  item.entities.forEach((x: T) => {
    x.fields.forEach(field => {
      if (
        field.field_class === enums.FieldClassEnum.Dimension &&
        field.type === enums.FieldExtTypeEnum.YesnoIsTrue
      ) {
        field.sql = `CASE
      WHEN (${field.sql}) IS TRUE THEN 'Yes'
      ELSE 'No'
    END`;
      }
    });
  });

  return item.entities;
}
