import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';
import { FileStoreResult } from '~common/interfaces/blockml/internal/file-store-result';

let func = common.FuncEnum.CheckStoreResults;

export function checkStoreResults(
  item: {
    stores: common.FileStore[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newStores: common.FileStore[] = [];

  item.stores.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (common.isUndefined(x.results)) {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.MISSING_RESULTS,
          message: `parameter "${common.ParameterEnum.Results}" is required for ${x.fileExt} file`,
          lines: [
            {
              line: 0,
              name: x.fileName,
              path: x.filePath
            }
          ]
        })
      );
      return;
    }

    let results: { resultName: string; resultLineNums: number[] }[] = [];

    x.results.forEach(resultElement => {
      if (
        common.isDefined(resultElement) &&
        resultElement.constructor !== Object
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.RESULTS_ELEMENT_IS_NOT_A_DICTIONARY,
            message:
              'found at least one results element that is not a dictionary',
            lines: [
              {
                line: x.results_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      Object.keys(resultElement)
        .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              common.ParameterEnum.Result.toString(),
              common.ParameterEnum.FractionTypes.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.UNKNOWN_RESULTS_ELEMENT_PARAMETER,
                message: `parameter "${parameter}" cannot be used in results element`,
                lines: [
                  {
                    line: resultElement[
                      (parameter + constants.LINE_NUM) as keyof FileStoreResult
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            Array.isArray(resultElement[parameter as keyof FileStoreResult]) &&
            [common.ParameterEnum.FractionTypes.toString()].indexOf(parameter) <
              0
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.UNEXPECTED_LIST,
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: resultElement[
                      (parameter + constants.LINE_NUM) as keyof FileStoreResult
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            resultElement[parameter as keyof FileStoreResult]?.constructor ===
            Object
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.UNEXPECTED_DICTIONARY,
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: resultElement[
                      (parameter + constants.LINE_NUM) as keyof FileStoreResult
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }
        });

      if (errorsOnStart === item.errors.length) {
        let resultsElementKeyLineNums: number[] = Object.keys(resultElement)
          .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
          .map(y => resultElement[y as keyof FileStoreResult] as number);

        if (common.isUndefined(resultElement.result)) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.MISSING_RESULT,
              message: `results element must have "${common.ParameterEnum.Result}" parameter`,
              lines: [
                {
                  line: Math.min(...resultsElementKeyLineNums),
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        if (common.isUndefined(resultElement.fraction_types)) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.MISSING_FRACTION_TYPES,
              message: `results element must have "${common.ParameterEnum.FractionTypes}" parameter`,
              lines: [
                {
                  line: Math.min(...resultsElementKeyLineNums),
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }
      }

      if (errorsOnStart === item.errors.length) {
        let index = results.findIndex(
          resultsElement => resultsElement.resultName === resultElement.result
        );

        if (index > -1) {
          results[index].resultLineNums.push(resultElement.result_line_num);
        } else {
          results.push({
            resultName: resultElement.result,
            resultLineNums: [resultElement.result_line_num]
          });
        }
      }
    });

    if (errorsOnStart === item.errors.length) {
      results.forEach(result => {
        if (result.resultLineNums.length > 1) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.DUPLICATE_RESULTS,
              message: `"${common.ParameterEnum.Result}" value must be unique across results elements`,
              lines: result.resultLineNums.map(l => ({
                line: l,
                name: x.fileName,
                path: x.filePath
              }))
            })
          );
          return;
        }

        //

        let resultWrongChars: string[] = [];

        let reg2 = common.MyRegex.CAPTURE_NOT_ALLOWED_RESULT_CHARS_G();
        let r2;

        while ((r2 = reg2.exec(result.resultName))) {
          resultWrongChars.push(r2[1]);
        }

        let resultWrongCharsString = '';

        if (resultWrongChars.length > 0) {
          resultWrongCharsString = [...new Set(resultWrongChars)].join(', '); // unique

          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.WRONG_CHARS_IN_RESULT,
              message: `Characters "${resultWrongCharsString}" cannot be used for result (only snake_case "a...z0...9_" is allowed)`,
              lines: [
                {
                  line: result.resultLineNums[0],
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return false;
        }
      });
    }

    if (errorsOnStart === item.errors.length) {
      newStores.push(x);
    }
  });

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Stores, newStores);

  return newStores;
}
