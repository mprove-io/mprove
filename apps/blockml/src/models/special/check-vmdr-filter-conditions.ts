import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';
import { MALLOY_FILTER_ANY } from '~common/_index';
import { bricksToFractions } from '~node-common/functions/bricks-to-fractions';

let func = common.FuncEnum.CheckVmdrFilterConditions;

export function checkVmdrFilterConditions<T extends types.sdrType>(
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

    // x.filters = {};

    // console.log('checkVmdrFilterConditions');
    // console.log(x);

    x.fields.forEach(field => {
      if (
        field.fieldClass !== common.FieldClassEnum.Filter ||
        common.isDefined(field.store_model)
      ) {
        return;
      }

      if (common.isUndefined(field.conditions)) {
        field.conditions = [
          MALLOY_FILTER_ANY
          // 'any'
        ];
      }

      field.apiFractions = [];

      // let p = processFilter({
      //   caseSensitiveStringFilters: caseSensitiveStringFilters,
      //   filterBricks: field.conditions,
      //   result: field.result,
      //   fractions: field.apiFractions
      // });

      let p = bricksToFractions({
        // caseSensitiveStringFilters: caseSensitiveStringFilters,
        filterBricks: field.conditions,
        result: field.result,
        fractions: field.apiFractions,
        isGetTimeRange: false
        // timezone: timezone,
        // weekStart: weekStart,
        // timeSpec: timeSpec
        // fractions: fractions,
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
                line: field.conditions_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      // x.filters[field.name] = common.makeCopy(field.conditions);
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
