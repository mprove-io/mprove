import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckSqlExist;

export function checkSqlExist<T extends types.vmdType>(
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

    x.fields.forEach(field => {
      if (field.fieldClass === apiToBlockml.FieldClassEnum.Filter) {
        if (common.isDefined(field.sql)) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.UNEXPECTED_SQL_IN_FILTER,
              message: `parameter "${enums.ParameterEnum.Sql}" can not be used with ${apiToBlockml.FieldClassEnum.Filter} field`,
              lines: [
                {
                  line: field.sql_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }
      } else if (
        common.isUndefined(field.sql) &&
        [
          apiToBlockml.FieldClassEnum.Dimension,
          apiToBlockml.FieldClassEnum.Time,
          apiToBlockml.FieldClassEnum.Measure,
          apiToBlockml.FieldClassEnum.Calculation
        ].indexOf(field.fieldClass) > -1
      ) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.MISSING_SQL,
            message: `parameter "${enums.ParameterEnum.Sql}" is required for "${field.fieldClass}"`,
            lines: [
              {
                line: field.name_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
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
