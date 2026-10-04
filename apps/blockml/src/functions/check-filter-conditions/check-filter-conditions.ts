import { ConfigService } from '@nestjs/config';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MALLOY_FILTER_ANY } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import { sdrType } from '#common/types/blockml/parts/internal/sdr-type';
import { bricksToFractions } from '#node-common/functions/bricks-to-fractions/bricks-to-fractions';

let func: Func = 'extra/check-filter-conditions';

export function checkFilterConditions<T extends sdrType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caseSensitiveStringFilters: boolean;
    caller: Caller;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId, caseSensitiveStringFilters } = item;
  log(cs, caller, func, structId, 'input.log', item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.fields.forEach(field => {
      if (field.fieldClass !== 'filter' || isDefined(field.store_model)) {
        return;
      }

      if (isUndefined(field.conditions)) {
        field.conditions = [MALLOY_FILTER_ANY];
      }

      field.apiFractions = [];

      let p = bricksToFractions({
        filterBricks: field.conditions,
        result: field.result,
        fractions: field.apiFractions,
        isGetTimeRange: false
      });

      if (p.valid === 0) {
        item.errors.push(
          new BmError({
            title: 'WRONG_FILTER_EXPRESSION',
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
    });

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  log(cs, caller, func, structId, 'out_errors.log', item.errors);
  log(cs, caller, func, structId, 'out_entities.log', newEntities);

  return newEntities;
}
