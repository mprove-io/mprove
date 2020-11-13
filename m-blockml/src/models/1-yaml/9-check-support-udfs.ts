import { constants } from '../../barrels/constants';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { api } from '../../barrels/api';
import { BmError } from '../bm-error';

let func = enums.FuncEnum.CheckSupportUdfs;

export function checkSupportUdfs(item: {
  filesAny: any[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}): any[] {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newFilesAny: any[] = [];

  item.filesAny.forEach(file => {
    if (
      [
        api.FileExtensionEnum.View.toString(),
        api.FileExtensionEnum.Model.toString()
      ].indexOf(file.ext) > -1 &&
      file.connection.type !== api.ConnectionTypeEnum.BigQuery
    ) {
      let udfsParameter = Object.keys(file)
        .filter(x => !x.toString().match(api.MyRegex.ENDS_WITH_LINE_NUM()))
        .find(p => p === enums.ParameterEnum.Udfs.toString());

      if (helper.isDefined(udfsParameter)) {
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

  helper.log(caller, func, structId, enums.LogTypeEnum.FilesAny, newFilesAny);
  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);

  return newFilesAny;
}
