import type { ConfigService } from '@nestjs/config';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import type { BmError } from '#blockml/models/bm-error';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import type { ProjectConnection } from '#common/zod/backend/project-connection';
import type { BmlFile } from '#common/zod/blockml/bml-file';
import type { FileMod } from '#common/zod/blockml/internal/file-mod';
import type { FileSpace } from '#common/zod/blockml/internal/file-space';
import type { MalloyConnection } from '#node-common/functions/make-malloy-connections';
import { buildFlatMalloyFieldItems } from './build-flat-malloy-field-items';
import { buildMods } from './build-mods';
import { checkBuildMetricsFieldGroups } from './check-build-metrics-field-groups';
import { checkModSpaces } from './check-mod-spaces';
import { checkTimeframes } from './check-timeframes';

export async function buildModStart(
  item: {
    files: BmlFile[];
    malloyConnections: MalloyConnection[];
    connections: ProjectConnection[];
    mods: FileMod[];
    spaces: FileSpace[];
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

  mods = buildFlatMalloyFieldItems(
    {
      mods: mods,
      projectId: item.projectId,
      errors: item.errors,
      structId: item.structId,
      caller: item.caller
    },
    cs
  );

  mods = checkModSpaces(
    {
      mods: mods,
      spaces: item.spaces,
      errors: item.errors,
      structId: item.structId,
      caller: item.caller
    },
    cs
  );

  mods = checkTimeframes(
    {
      mods: mods,
      errors: item.errors,
      structId: item.structId,
      caller: item.caller
    },
    cs
  );

  mods = checkBuildMetricsFieldGroups(
    {
      mods: mods,
      errors: item.errors,
      structId: item.structId,
      caller: item.caller
    },
    cs
  );

  return { mods: mods };
}
