import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';

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

      file.connection = connection;
    }
    newFilesAny.push(file);
  });

  log(cs, caller, func, structId, LogTypeEnum.FilesAny, newFilesAny);
  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  return newFilesAny;
}
