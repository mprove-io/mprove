import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckConnections;

export function checkConnections(
  item: {
    filesAny: any[];
    connections: common.ProjectConnection[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
): any[] {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newFilesAny: any[] = [];

  item.filesAny.forEach(file => {
    if ([common.FileExtensionEnum.Store].indexOf(file.ext) > -1) {
      let parameters = Object.keys(file).filter(
        x => !x.toString().match(common.MyRegex.ENDS_WITH_LINE_NUM())
      );

      if (parameters.indexOf(common.ParameterEnum.Connection.toString()) < 0) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.MISSING_CONNECTION,
            message: `parameter "${common.ParameterEnum.Connection}" must be specified`,
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

      let connectionName = file[common.ParameterEnum.Connection];

      let connection = item.connections.find(
        c => c.connectionId === connectionName
      );

      if (common.isUndefined(connection)) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.CONNECTION_NOT_FOUND,
            message: `project connection "${connectionName}" not found`,
            lines: [
              {
                line: file[
                  common.ParameterEnum.Connection + constants.LINE_NUM
                ],
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

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.FilesAny,
    newFilesAny
  );
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );

  return newFilesAny;
}
