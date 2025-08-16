import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckDimensions;

export function checkDimensions<T extends types.vsmType>(
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
      if (field.fieldClass !== common.FieldClassEnum.Dimension) {
        return;
      }

      if (common.isUndefined(field.type)) {
        field.type = common.FieldTypeEnum.Custom;
        field.type_line_num = 0;
      } else if (common.DIMENSION_TYPE_VALUES.indexOf(field.type) < 0) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.WRONG_DIMENSION_TYPE,
            message: `"${field.type}" is not valid type for ${common.FieldClassEnum.Dimension}`,
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
