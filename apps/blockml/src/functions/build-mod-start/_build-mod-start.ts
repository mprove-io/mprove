import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { CallerEnum } from '#common/enums/special/caller.enum';
import type { ProjectConnection } from '#common/zod/backend/project-connection';
import type { BmlFile } from '#common/zod/blockml/bml-file';
import type { FileMod } from '#common/zod/blockml/internal/file-mod';
import { MalloyConnection } from '#node-common/functions/make-malloy-connections';
import { buildMods } from './build-mods';

export async function buildModStart(
  item: {
    files: BmlFile[];
    malloyConnections: MalloyConnection[];
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
