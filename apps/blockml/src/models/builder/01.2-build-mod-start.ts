import { ConfigService } from '@nestjs/config';
import { barModStart } from '~blockml/barrels/bar-mod-start';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export async function buildModStart(
  item: {
    files: common.BmlFile[];
    connections: common.ProjectConnection[];
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

  // let buildMalloyModel = await barModStart.buildMalloyModel(
  //   {
  //     connections: item.connections,
  //     tempDir: item.tempDir,
  //     projectId: item.projectId,
  //     structId: item.structId,
  //     errors: item.errors,
  //     caller: item.caller
  //   },
  //   cs
  // );

  mods = await barModStart.buildMods(
    {
      mods: mods,
      connections: item.connections,
      tempDir: item.tempDir,
      projectId: item.projectId,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return { mods: mods };
}
