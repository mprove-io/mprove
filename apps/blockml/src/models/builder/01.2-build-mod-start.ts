import { ConfigService } from '@nestjs/config';
import { barModStart } from '~blockml/barrels/bar-mod-start';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildModStart(
  item: {
    mods: common.FileMod[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let mods = item.mods;

  mods = barModStart.buildSource(
    {
      mods: mods,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return mods;
}
