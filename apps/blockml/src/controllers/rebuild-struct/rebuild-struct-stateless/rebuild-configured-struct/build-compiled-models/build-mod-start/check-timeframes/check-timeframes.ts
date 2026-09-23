import type { ConfigService } from '@nestjs/config';
import { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/extra/log';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isUndefined } from '#common/functions/is-undefined';
import type { FileMod } from '#common/zod/blockml/internal/file-mod';
import type { FlatMalloyFieldItem } from '#common/zod/blockml/internal/flat-malloy-field-item';

let func = FuncEnum.CheckTimeframes;

export function checkTimeframes(
  item: {
    mods: FileMod[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

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
          title: ErTitleEnum.TIMEFRAME_MUST_BE_BASED_ON_A_FIELD_WITH_T_SUFFIX,
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Mods, newMods);

  return newMods;
}

type FieldWithTimeframe = FlatMalloyFieldItem['field'] & {
  type: {
    timeframe?: string;
  };
};
