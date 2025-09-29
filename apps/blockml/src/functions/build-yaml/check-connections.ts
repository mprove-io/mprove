import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { LINE_NUM } from '~common/constants/top-blockml';
import { ParameterEnum } from '~common/enums/docs/parameter.enum';
import { FileExtensionEnum } from '~common/enums/file-extension.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { ErTitleEnum } from '~common/enums/special/er-title.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { ProjectConnection } from '~common/interfaces/backend/project-connection';
import { MyRegex } from '~common/models/my-regex';
import { log } from '../extra/log';

let func = FuncEnum.CheckConnections;

export function checkConnections(
  item: {
    filesAny: any[];
    connections: ProjectConnection[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
): any[] {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newFilesAny: any[] = [];

  item.filesAny.forEach(file => {
    if ([FileExtensionEnum.Store].indexOf(file.ext) > -1) {
      let parameters = Object.keys(file).filter(
        x => !x.toString().match(MyRegex.ENDS_WITH_LINE_NUM())
      );

      if (parameters.indexOf(ParameterEnum.Connection.toString()) < 0) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.MISSING_CONNECTION,
            message: `parameter "${ParameterEnum.Connection}" must be specified`,
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

      let connectionName = file[ParameterEnum.Connection];

      let connection = item.connections.find(
        c => c.connectionId === connectionName
      );

      if (isUndefined(connection)) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.CONNECTION_NOT_FOUND,
            message: `project connection "${connectionName}" not found`,
            lines: [
              {
                line: file[ParameterEnum.Connection + LINE_NUM],
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

  log(cs, caller, func, structId, LogTypeEnum.FilesAny, newFilesAny);
  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  return newFilesAny;
}
