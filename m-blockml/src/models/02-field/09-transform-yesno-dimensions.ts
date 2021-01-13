import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { types } from '../../barrels/types';
import { BmError } from '../bm-error';

let func = enums.FuncEnum.TransformYesNoDimensions;

export function transformYesNoDimensions<T extends types.vmType>(item: {
  entities: Array<T>;
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  item.entities.forEach((x: T) => {
    if (x.fileExt === api.FileExtensionEnum.Dashboard) {
      return;
    }

    x.fields.forEach(field => {
      if (
        field.fieldClass === api.FieldClassEnum.Dimension &&
        field.type === api.FieldTypeEnum.YesnoIsTrue
      ) {
        field.sql = `CASE WHEN (${field.sql}) IS TRUE THEN 'Yes' ELSE 'No' END`;
      }
    });
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Entities, item.entities);

  return item.entities;
}