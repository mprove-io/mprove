import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { ErTitleEnum } from '~common/enums/special/er-title.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { makeCopy } from '~common/functions/make-copy';
import { BlockmlConfig } from '~common/interfaces/blockml/blockml-config';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';
import { Preset } from '~common/interfaces/blockml/preset';
import { log } from '../extra/log';

let func = FuncEnum.ApplyStorePresets;

export function applyStorePresets(
  item: {
    stores: FileStore[];
    presets: Preset[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId, presets } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newStores: FileStore[] = [];

  item.stores.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (isDefined(x.preset)) {
      let presetIds = presets.map(x => x.presetId);

      if (presetIds.indexOf(x.preset) < 0) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.WRONG_PRESET,
            message: `Preset "${x.preset}" not found`,
            lines: [
              {
                line: x.preset_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      } else {
        let preset = presets.find(y => y.presetId === x.preset);

        if (x.label_line_num === 0 && isDefined(preset.parsedContent.label)) {
          x.label = preset.parsedContent.label;
        }

        Object.keys(preset.parsedContent).forEach(key => {
          if (isUndefined((x as any)[key])) {
            (x as any)[key] = makeCopy(preset.parsedContent[key]);
            // let lineNumName = `${key}_line_num`;
            // (x as any)[lineNumName] = x.preset_line_num;
          }
        });
      }
    }

    if (errorsOnStart === item.errors.length) {
      newStores.push(x);
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Stores, newStores);

  return newStores;
}
