import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileMod } from '#common/types/blockml/parts/internal/file-mod';
import type { FlatMalloyFieldItem } from '#common/types/blockml/parts/internal/flat-malloy-field-item';

let func: Func = 'build-mod-start/check-timeframes';

export function checkTimeframes(item: {
  mods: FileMod[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileMod[], never> {
  let { caller, structId, cs } = item;

  log(cs, caller, func, structId, 'input.log', item);

  let newMods: FileMod[] = [];

  item.mods.forEach(mod => {
    let errorsOnStart = item.errors.length;
    let fieldItems = mod.flatMalloyFieldItems;

    if (isUndefined(fieldItems)) {
      return;
    }

    fieldItems.forEach(fieldItem => {
      let field = fieldItem.field as FieldWithTimeframe;
      let timeframe = field.type?.timeframe;

      if (isUndefined(timeframe)) {
        return;
      }

      let sourceExpression = fieldItem.sourceExpression;

      let sourceExpressionFieldPath =
        sourceExpression?.node === 'trunc' &&
        sourceExpression.units === timeframe &&
        sourceExpression.e?.node === 'field'
          ? sourceExpression.e.path
          : undefined;

      let baseFieldName = sourceExpressionFieldPath?.at(-1);

      if (!baseFieldName || baseFieldName?.endsWith('_t') === true) {
        return;
      }

      item.errors.push(
        new BmError({
          title: 'TIMEFRAME_MUST_BE_BASED_ON_A_FIELD_WITH_T_SUFFIX',
          message: `Timeframe field "${fieldItem.field.name}" must be based on a field with "_t" suffix`,
          lines: [
            {
              line: fieldItem.lineNum,
              name: fieldItem.fileName,
              path: fieldItem.filePath
            }
          ]
        })
      );
    });

    if (errorsOnStart === item.errors.length) {
      newMods.push(mod);
    }
  });

  log(cs, caller, func, structId, 'out_errors.log', item.errors);
  log(cs, caller, func, structId, 'out_mods.log', newMods);

  return Result.succeed(newMods);
}

type FieldWithTimeframe = FlatMalloyFieldItem['field'] & {
  type: {
    timeframe?: string;
  };
};
