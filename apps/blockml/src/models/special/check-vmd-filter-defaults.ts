import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';
import { processFilter } from './process-filter';

let func = enums.FuncEnum.CheckVmdFilterDefaults;

export function checkVmdFilterDefaults<T extends types.vmdType>(
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

    x.filters = {};

    x.fields.forEach(field => {
      if (field.fieldClass !== common.FieldClassEnum.Filter) {
        return;
      }

      if (
        x.fileExt === common.FileExtensionEnum.Dashboard &&
        common.isUndefined(field.default)
      ) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.DASHBOARD_FILTER_MUST_HAVE_DEFAULT,
            message:
              `${common.FileExtensionEnum.Dashboard} ${common.FieldClassEnum.Filter} must ` +
              `have "${enums.ParameterEnum.Default}" parameter`,
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

      if (common.isUndefined(field.default)) {
        x.filters[field.name] = [];
      } else {
        let p = processFilter({
          filterBricks: field.default,
          result: field.result
        });

        if (p.valid === 0) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.WRONG_FILTER_EXPRESSION,
              message:
                `found expression "${p.brick}" for result "${field.result}" of ` +
                `filter "${field.name}"`,
              lines: [
                {
                  line: field.default_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        x.filters[field.name] = common.makeCopy(field.default);
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
