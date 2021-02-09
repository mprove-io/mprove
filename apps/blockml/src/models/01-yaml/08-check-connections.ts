import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckConnections;

export function checkConnections(
  item: {
    filesAny: any[];
    connections: common.ProjectConnection[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
): any[] {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newFilesAny: any[] = [];

  item.filesAny.forEach(file => {
    if (
      [common.FileExtensionEnum.View, common.FileExtensionEnum.Model].indexOf(
        file.ext
      ) > -1
    ) {
      let parameters = Object.keys(file).filter(
        x => !x.toString().match(common.MyRegex.ENDS_WITH_LINE_NUM())
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

      if (common.isUndefined(connection)) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.CONNECTION_NOT_FOUND,
            message: `project connection "${connectionName}" not found`,
            lines: [
              {
                line: file[enums.ParameterEnum.Connection + constants.LINE_NUM],
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
    enums.LogTypeEnum.FilesAny,
    newFilesAny
  );
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);

  return newFilesAny;
}
