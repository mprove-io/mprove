import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { constants } from '../../barrels/constants';
import { BmError } from '../bm-error';

let logPack = '1-yaml';
let logFolder = '7-check-top-values';

export function checkTopValues(item: {
  filesAny: any[];
  errors: BmError[];
  structId: string;
}): any[] {
  let logId = item.structId;
  helper.log(logId, logPack, logFolder, enums.LogEnum.Input, item);

  let newFilesAny: any[] = [];

  item.filesAny.forEach(file => {
    let errorsOnStart = item.errors.length;

    Object.keys(file)
      .filter(x => !x.toString().match(api.MyRegex.ENDS_WITH_LINE_NUM()))
      .forEach(parameter => {
        if (
          [
            enums.ParameterEnum.Path.toString(),
            enums.ParameterEnum.Ext.toString(),
            enums.ParameterEnum.Name.toString()
          ].indexOf(parameter) > -1
        ) {
          return;
        }

        if (
          parameter === enums.ParameterEnum.Hidden.toString() &&
          !file[parameter].toString().match(api.MyRegex.TRUE_FALSE())
        ) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.WRONG_HIDDEN,
              message:
                "parameter \"hidden:\" must be 'true' or 'false' if specified",
              lines: [
                {
                  line: file[parameter + constants.LINE_NUM],
                  name: file.name,
                  path: file.path
                }
              ]
            })
          );

          return;
        }

        if (
          [
            enums.ParameterEnum.Udf.toString(),
            enums.ParameterEnum.View.toString(),
            enums.ParameterEnum.Model.toString(),
            enums.ParameterEnum.Dashboard.toString()
          ].indexOf(parameter) > -1 &&
          file[parameter]
            .toString()
            .match(api.MyRegex.CAPTURE_SPECIAL_CHARS_G())
        ) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.WRONG_CHAR_IN_PARAMETER_VALUE,
              message: `parameter "${parameter}" contains wrong characters or whitespace`,
              lines: [
                {
                  line: file[parameter + constants.LINE_NUM],
                  name: file.name,
                  path: file.path
                }
              ]
            })
          );

          return;
        }
      });

    let errorsOnEnd = item.errors.length;
    if (errorsOnStart === errorsOnEnd) {
      newFilesAny.push(file);
    }
  });

  helper.log(logId, logPack, logFolder, enums.LogEnum.FilesAny, newFilesAny);
  helper.log(logId, logPack, logFolder, enums.LogEnum.Errors, item.errors);

  return newFilesAny;
}
