import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckCalculations;

export function checkCalculations<T extends types.vmType>(
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

    if (
      x.fileExt === common.FileExtensionEnum.Dashboard ||
      x.fileExt === common.FileExtensionEnum.Report
    ) {
      newEntities.push(x);
      return;
    }

    x.fields.forEach(field => {
      if (field.fieldClass !== common.FieldClassEnum.Calculation) {
        return;
      }
      if (
        field.sql &&
        !field.sql.match(common.MyRegex.CONTAINS_BLOCKML_REF())
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.CALCULATION_SQL_MISSING_BLOCKML_REFERENCE,
            message: `${common.FieldClassEnum.Calculation} ${common.ParameterEnum.Sql} must have a reference`,
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
