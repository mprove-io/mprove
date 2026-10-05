import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { LINE_NUM } from '#common/constants/top-blockml';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ProjectConnection } from '#common/types/backend/parts/project-connection';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileExtension } from '#common/types/blockml/parts/file/file-extension';
import type { FileParameter } from '#common/types/blockml/parts/file/file-parameter';

let func: Func = 'build-yaml/check-connections';

export function checkConnections(item: {
  filesAny: any[];
  connections: ProjectConnection[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<any[], never> {
  let { caller, structId, cs } = item;
  log(cs, caller, func, structId, 'input.log', item);

  let newFilesAny: any[] = [];

  item.filesAny.forEach(file => {
    if (file.ext === ('.store' satisfies FileExtension)) {
      let parameters = Object.keys(file).filter(
        x => !x.toString().match(MyRegex.ENDS_WITH_LINE_NUM())
      );

      if (
        parameters.indexOf(('connection' satisfies FileParameter).toString()) <
        0
      ) {
        item.errors.push(
          new BmError({
            title: 'MISSING_CONNECTION',
            message: `parameter "${'connection' satisfies FileParameter}" must be specified`,
            lines: [
              {
                line: 0,
                name: file.name,
                path: file.path
              }
            ]
          })
        );
        return;
      }

      let connectionName = file['connection' satisfies FileParameter];

      let connection = item.connections.find(
        c => c.connectionId === connectionName
      );

      if (isUndefined(connection)) {
        item.errors.push(
          new BmError({
            title: 'CONNECTION_NOT_FOUND',
            message: `project connection "${connectionName}" not found`,
            lines: [
              {
                line: file[('connection' satisfies FileParameter) + LINE_NUM],
                name: file.name,
                path: file.path
              }
            ]
          })
        );
        return;
      }

      file.connectionId = connection.connectionId;
      file.connectionType = connection.type;
    }
    newFilesAny.push(file);
  });

  log(cs, caller, func, structId, 'out_filesAny.log', newFilesAny);
  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  return Result.succeed(newFilesAny);
}
