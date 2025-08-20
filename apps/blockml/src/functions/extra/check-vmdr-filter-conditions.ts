import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { MALLOY_FILTER_ANY } from '~common/constants/top';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { ErTitleEnum } from '~common/enums/special/er-title.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { sdrType } from '~common/types/sdr-type';
import { bricksToFractions } from '~node-common/functions/bricks-to-fractions';
import { log } from './log';

let func = FuncEnum.CheckVmdrFilterConditions;

export function checkVmdrFilterConditions<T extends sdrType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caseSensitiveStringFilters: boolean;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId, caseSensitiveStringFilters } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    // x.filters = {};

    // console.log('checkVmdrFilterConditions');
    // console.log(x);

    x.fields.forEach(field => {
      if (
        field.fieldClass !== FieldClassEnum.Filter ||
        isDefined(field.store_model)
      ) {
        return;
      }

      if (isUndefined(field.conditions)) {
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
            title: ErTitleEnum.WRONG_FILTER_EXPRESSION,
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

      // x.filters[field.name] = makeCopy(field.conditions);
    });

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newEntities);

  return newEntities;
}
