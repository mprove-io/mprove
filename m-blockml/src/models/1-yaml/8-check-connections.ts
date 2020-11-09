import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';

let logPack = '1-yaml';
let logFolder = '8-check-connections';

export function checkConnections(item: {
  filesAny: any[];
  connections: api.ProjectConnection[];
  errors: BmError[];
  structId: string;
}): any[] {
  let logId = item.structId;
  helper.log(logId, logPack, logFolder, enums.LogEnum.Input, item);

  let newFilesAny: any[] = [];

  item.filesAny.forEach(file => {
    if (
      [api.FileExtensionEnum.View, api.FileExtensionEnum.Model].indexOf(
        file.ext
      ) > -1
    ) {
      let parameters = Object.keys(file).filter(
        x => !x.toString().match(api.MyRegex.ENDS_WITH_LINE_NUM())
      );

      if (parameters.indexOf(enums.ParameterEnum.Connection.toString()) < 0) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.MISSING_CONNECTION,
            message: `parameter "${enums.ParameterEnum.Connection}" must be specified`,
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

      let connectionName = file[enums.ParameterEnum.Connection];

      let connection = item.connections.find(c => c.name === connectionName);

      if (!connection) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.CONNECTION_NOT_FOUND,
            message: `project connection "${connectionName}" not found`,
            lines: [
              {
                line: file[enums.ParameterEnum.Connection + '_line_num'],
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

  helper.log(logId, logPack, logFolder, enums.LogEnum.FilesAny, newFilesAny);
  helper.log(logId, logPack, logFolder, enums.LogEnum.Errors, item.errors);

  return newFilesAny;
}
