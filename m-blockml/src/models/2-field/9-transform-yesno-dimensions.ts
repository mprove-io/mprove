import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { vmType } from './_vm-type';

let func = enums.FuncEnum.TransformYesNoDimensions;

export function transformYesNoDimensions<T extends vmType>(item: {
  entities: Array<T>;
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  item.entities.forEach((x: T) => {
    x.fields.forEach(field => {
      if (
        field.fieldClass === enums.FieldClassEnum.Dimension &&
        field.type === enums.FieldAnyTypeEnum.YesnoIsTrue
      ) {
        field.sql = `CASE
      WHEN (${field.sql}) IS TRUE THEN 'Yes'
      ELSE 'No'
    END`;
      }
    });
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Entities, item.entities);
  return item.entities;
}
