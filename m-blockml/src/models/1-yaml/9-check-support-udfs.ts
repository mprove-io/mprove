import { constants } from '../../barrels/constants';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { api } from '../../barrels/api';
import { BmError } from '../bm-error';

let logPack = '1-yaml';
let logFolder = '9-check-support-udfs';

export function checkSupportUdfs(item: {
  filesAny: any[];
  errors: BmError[];
  structId: string;
}): any[] {
  let logId = item.structId;
  helper.log(logId, logPack, logFolder, enums.LogEnum.Input, item);

  let newFilesAny: any[] = [];

  item.filesAny.forEach(file => {
    if (
      [
        api.FileExtensionEnum.View.toString(),
        api.FileExtensionEnum.Model.toString()
      ].indexOf(file.ext) > -1 &&
      file.connection.connectionType !== api.ConnectionTypeEnum.BigQuery
    ) {
      let udfsParameter = Object.keys(file)
        .filter(x => !x.toString().match(api.MyRegex.ENDS_WITH_LINE_NUM()))
        .find(p => p === enums.ParameterEnum.Udfs.toString());

      if (!!udfsParameter) {
        item.errors.push(
          new BmError({
            title:
              enums.ErTitleEnum.UDFS_ARE_NOT_SUPPORTED_FOR_SPECIFIED_CONNECTION,
            message: `parameter "udfs" can not be used for connection type "${file.connection.type}"`,
            lines: [
              {
                line:
                  file[
                    enums.ParameterEnum.Udfs.toString() + constants.LINE_NUM
                  ],
                name: file.name,
                path: file.path
              }
            ]
          })
        );

        return;
      }
    }
    newFilesAny.push(file);
  });

  helper.log(logId, logPack, logFolder, enums.LogEnum.FilesAny, newFilesAny);
  helper.log(logId, logPack, logFolder, enums.LogEnum.Errors, item.errors);

  return newFilesAny;
}
