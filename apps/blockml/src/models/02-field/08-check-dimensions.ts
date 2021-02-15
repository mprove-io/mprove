import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckDimensions;

export function checkDimensions<T extends types.vmType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (x.fileExt === common.FileExtensionEnum.Dashboard) {
      newEntities.push(x);
      return;
    }

    x.fields.forEach(field => {
      if (field.fieldClass !== apiToBlockml.FieldClassEnum.Dimension) {
        return;
      }

      if (common.isUndefined(field.type)) {
        field.type = apiToBlockml.FieldTypeEnum.Custom;
        field.type_line_num = 0;
      } else if (
        [
          apiToBlockml.FieldTypeEnum.Custom,
          apiToBlockml.FieldTypeEnum.YesnoIsTrue
        ].indexOf(field.type) < 0
      ) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.WRONG_DIMENSION_TYPE,
            message: `"${field.type}" is not valid type for ${apiToBlockml.FieldClassEnum.Dimension}`,
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

      if (x.connection.type !== common.ConnectionTypeEnum.BigQuery) {
        if (common.isDefined(field.unnest)) {
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
