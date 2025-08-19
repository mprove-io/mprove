import { PostgresConnection } from '@malloydata/db-postgres';
import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';

export async function buildModStart(
  item: {
    files: BmlFile[];
    malloyConnections: PostgresConnection[];
    connections: ProjectConnection[];
    mods: FileMod[];
    tempDir: string;
    projectId: string;
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let mods = item.mods;

  // let buildMalloyModel = await buildMalloyModel(
  //   {
  //     malloyConnections: item.malloyConnections,
  //     tempDir: item.tempDir,
  //     projectId: item.projectId,
  //     structId: item.structId,
  //     errors: item.errors,
  //     caller: item.caller
  //   },
  //   cs
  // );

  mods = await buildMods(
    {
      mods: mods,
      malloyConnections: item.malloyConnections,
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
