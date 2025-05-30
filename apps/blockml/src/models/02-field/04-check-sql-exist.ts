import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckSqlExist;

export function checkSqlExist<T extends types.vsmdrType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.fields.forEach(field => {
      if (field.fieldClass === common.FieldClassEnum.Filter) {
        if (common.isDefined(field.sql)) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.UNEXPECTED_SQL_IN_FILTER,
              message: `parameter "${common.ParameterEnum.Sql}" cannot be used with ${common.FieldClassEnum.Filter} field`,
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
          common.FieldClassEnum.Dimension,
          common.FieldClassEnum.Time,
          common.FieldClassEnum.Measure,
          common.FieldClassEnum.Calculation
        ].indexOf(field.fieldClass) > -1
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.MISSING_SQL,
            message: `parameter "${common.ParameterEnum.Sql}" is required for "${field.fieldClass}"`,
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

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}
