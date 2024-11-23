import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';
import { processFilter } from './process-filter';

let func = common.FuncEnum.CheckVmdFilterDefaults;

export function checkVmdFilterDefaults<T extends types.vmdType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caseSensitiveStringFilters: boolean;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId, caseSensitiveStringFilters } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.filters = {};

    x.fields.forEach(field => {
      if (field.fieldClass !== common.FieldClassEnum.Filter) {
        return;
      }

      if (common.isUndefined(field.default)) {
        field.default = ['any'];
      }

      field.fractions = [];

      let p = processFilter({
        caseSensitiveStringFilters: caseSensitiveStringFilters,
        filterBricks: field.default,
        result: field.result,
        fractions: field.fractions
      });

      if (p.valid === 0) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.WRONG_FILTER_EXPRESSION,
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
