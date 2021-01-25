import { enums } from '~/barrels/enums';
import { api } from '~/barrels/api';
import { helper } from '~/barrels/helper';
import { types } from '~/barrels/types';
import { BmError } from '~/models/bm-error';
import { ConfigService } from '@nestjs/config';

let func = enums.FuncEnum.CheckSqlExist;

export function checkSqlExist<T extends types.vmdType>(
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

    x.fields.forEach(field => {
      if (field.fieldClass === api.FieldClassEnum.Filter) {
        if (helper.isDefined(field.sql)) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.UNEXPECTED_SQL_IN_FILTER,
              message: `parameter "${enums.ParameterEnum.Sql}" can not be used with ${api.FieldClassEnum.Filter} field`,
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
        helper.isUndefined(field.sql) &&
        [
          api.FieldClassEnum.Dimension,
          api.FieldClassEnum.Time,
          api.FieldClassEnum.Measure,
          api.FieldClassEnum.Calculation
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
