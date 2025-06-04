import { ConfigService } from '@nestjs/config';
import { barModStart } from '~blockml/barrels/bar-mod-start';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export async function buildModStart(
  item: {
    files: common.BmlFile[];
    mods: common.FileMod[];
    tempDir: string;
    projectId: string;
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let mods = item.mods;

  let buildSourceResult = await barModStart.buildSource(
    {
      mods: mods,
      tempDir: item.tempDir,
      projectId: item.projectId,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  mods = buildSourceResult.mods;
  let malloyItems = buildSourceResult.malloyItems;

  return { mods: mods, malloyItems: malloyItems };
}
