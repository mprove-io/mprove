import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';
import { helper } from '~/barrels/helper';
import { BmError } from '~/models/bm-error';
import { types } from '~/barrels/types';
import { ConfigService } from '@nestjs/config';

let func = enums.FuncEnum.CheckDimensions;

export function checkDimensions<T extends types.vmType>(
  item: {
    entities: Array<T>;
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (x.fileExt === api.FileExtensionEnum.Dashboard) {
      newEntities.push(x);
      return;
    }

    x.fields.forEach(field => {
      if (field.fieldClass !== api.FieldClassEnum.Dimension) {
        return;
      }

      if (helper.isUndefined(field.type)) {
        field.type = api.FieldTypeEnum.Custom;
        field.type_line_num = 0;
      } else if (
        [api.FieldTypeEnum.Custom, api.FieldTypeEnum.YesnoIsTrue].indexOf(
          field.type
        ) < 0
      ) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.WRONG_DIMENSION_TYPE,
            message: `"${field.type}" is not valid type for ${api.FieldClassEnum.Dimension}`,
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

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(
    cs,
    caller,
    func,
    structId,
    enums.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}
