import { ConfigService } from '@nestjs/config';
import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';
import { helper } from '~/barrels/helper';
import { types } from '~/barrels/types';
import { BmError } from '~/models/bm-error';

let func = enums.FuncEnum.CheckCalculations;

export function checkCalculations<T extends types.vmType>(
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
      if (field.fieldClass !== api.FieldClassEnum.Calculation) {
        return;
      }
      if (field.sql && !field.sql.match(api.MyRegex.CONTAINS_BLOCKML_REF())) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.CALCULATION_SQL_MISSING_BLOCKML_REFERENCE,
            message: `${api.FieldClassEnum.Calculation} ${enums.ParameterEnum.Sql} must have a BlockML reference`,
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
