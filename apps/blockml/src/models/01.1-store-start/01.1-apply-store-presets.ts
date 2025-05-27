import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { Preset } from '~blockml/interfaces/preset';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.ApplyStorePresets;

export function applyStorePresets(
  item: {
    stores: common.FileStore[];
    presets: Preset[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId, presets } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newStores: common.FileStore[] = [];

  item.stores.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (common.isDefined(x.preset)) {
      let presetNames = presets.map(x => x.name);

      if (presetNames.indexOf(x.preset) < 0) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.WRONG_PRESET,
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
      }
    }

    if (errorsOnStart === item.errors.length) {
      newStores.push(x);
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
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Stores, newStores);

  return newStores;
}
