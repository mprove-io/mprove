import { api } from '../../barrels/api';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { types } from '../../barrels/types';

let func = enums.FuncEnum.CheckDimensions;

export function checkDimensions<T extends types.vmType>(item: {
  entities: Array<T>;
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.fields.forEach(field => {
      if (field.fieldClass !== enums.FieldClassEnum.Dimension) {
        return;
      }

      if (helper.isUndefined(field.type)) {
        field.type = enums.FieldAnyTypeEnum.Custom;
        field.type_line_num = 0;
      } else if (
        [
          enums.FieldAnyTypeEnum.Custom,
          enums.FieldAnyTypeEnum.YesnoIsTrue
        ].indexOf(field.type) < 0
      ) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.WRONG_DIMENSION_TYPE,
            message: `"${field.type}" is not valid type for ${enums.FieldClassEnum.Dimension}`,
            lines: [
              {
                line: field.type_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (x.connection.type !== api.ConnectionTypeEnum.BigQuery) {
        if (helper.isDefined(field.unnest)) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.UNNEST_IS_NOT_SUPPORTED_FOR_CONNECTION,
              message: `parameter "${enums.ParameterEnum.Unnest}" can not be used with ${x.connection.type}`,
              lines: [
                {
                  line: field.unnest_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }
      }
    });

    let errorsOnEnd = item.errors.length;
    if (errorsOnStart === errorsOnEnd) {
      newEntities.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Entities, newEntities);

  return newEntities;
}
