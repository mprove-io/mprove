import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { prePopulateMalloySchemaCache } from '#blockml/functions/schema-parse/pre-populate-malloy-schema-cache';
import { makeId } from '#common/functions/make-id';
import type { ProjectConnection } from '#common/zod/backend/project-connection';
import type { BmlFile } from '#common/zod/blockml/bml-file';
import type { FileMod } from '#common/zod/blockml/internal/file-mod';
import {
  type MalloyConnection,
  makeMalloyConnections
} from '#node-common/functions/make-malloy-connections';
import { prepareMalloyFile } from './prepare-malloy-file/prepare-malloy-file';

export type MalloyPayload = {
  mods: FileMod[];
  tempDir: string;
  malloyConnections: MalloyConnection[];
};

export async function prepareMalloyPayload(item: {
  files: BmlFile[];
  isUseCache: boolean;
  projectConnections: ProjectConnection[];
  cs: ConfigService<BlockmlConfig>;
}): Result.ResultAsync<MalloyPayload, never> {
  let blockmlDataPath: string =
    item.cs.get<BlockmlConfig['blockmlData']>('blockmlData');

  let tempDir: string = `${blockmlDataPath}/${Date.now()}-${makeId()}`;

  let malloyFiles: BmlFile[] =
    item.isUseCache === true
      ? []
      : item.files.filter(file => file.name.endsWith('.malloy'));

  let mods: FileMod[] = [];

  for (let i = 0; i < malloyFiles.length; i++) {
    let prepareResult = await prepareMalloyFile({
      file: malloyFiles[i],
      tempDir: tempDir
    });

    let preparedMods: FileMod[] = Result.unwrap(prepareResult);

    mods.push(...preparedMods);
  }

  let malloyConnections: MalloyConnection[] = makeMalloyConnections({
    connections: item.projectConnections
  });

  prePopulateMalloySchemaCache({
    malloyConnections: malloyConnections,
    projectConnections: item.projectConnections
  });

  let output: MalloyPayload = {
    mods: mods,
    tempDir: tempDir,
    malloyConnections: malloyConnections
  };

  return Result.succeed(output);
}
