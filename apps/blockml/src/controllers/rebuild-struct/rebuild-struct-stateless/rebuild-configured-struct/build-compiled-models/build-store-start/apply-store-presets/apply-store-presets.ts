import { ConfigService } from '@nestjs/config';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import type { Preset } from '#common/types/blockml/parts/preset';

let func: Func = 'build-store-start/apply-store-presets';

export function applyStorePresets(
  item: {
    stores: FileStore[];
    presets: Preset[];
    errors: BmError[];
    structId: string;
    caller: Caller;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId, presets } = item;
  log(cs, caller, func, structId, 'input.log', item);

  let newStores: FileStore[] = [];

  item.stores.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (isDefined(x.preset)) {
      let presetIds = presets.map(x => x.presetId);

      if (presetIds.indexOf(x.preset) < 0) {
        item.errors.push(
          new BmError({
            title: 'WRONG_PRESET',
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
          }
        });
      }
    }

    if (errorsOnStart === item.errors.length) {
      newStores.push(x);
    }
  });

  log(cs, caller, func, structId, 'out_errors.log', item.errors);
  log(cs, caller, func, structId, 'out_stores.log', newStores);

  return newStores;
}
