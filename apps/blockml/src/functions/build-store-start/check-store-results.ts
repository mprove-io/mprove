import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';
import { FileStoreResult } from '~common/interfaces/blockml/internal/file-store-result';

let func = FuncEnum.CheckStoreResults;

export function checkStoreResults(
  item: {
    stores: FileStore[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newStores: FileStore[] = [];

  item.stores.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (isUndefined(x.results)) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.MISSING_RESULTS,
          message: `parameter "${ParameterEnum.Results}" is required for ${x.fileExt} file`,
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
      if (isDefined(resultElement) && resultElement.constructor !== Object) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.RESULTS_ELEMENT_IS_NOT_A_DICTIONARY,
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
        .filter(k => !k.match(MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              ParameterEnum.Result.toString(),
              ParameterEnum.FractionTypes.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.UNKNOWN_RESULTS_ELEMENT_PARAMETER,
                message: `parameter "${parameter}" cannot be used in results element`,
                lines: [
                  {
                    line: resultElement[
                      (parameter + LINE_NUM) as keyof FileStoreResult
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
            [ParameterEnum.FractionTypes.toString()].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.UNEXPECTED_LIST,
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: resultElement[
                      (parameter + LINE_NUM) as keyof FileStoreResult
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
                title: ErTitleEnum.UNEXPECTED_DICTIONARY,
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: resultElement[
                      (parameter + LINE_NUM) as keyof FileStoreResult
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
          .filter(y => y.match(MyRegex.ENDS_WITH_LINE_NUM()))
          .map(y => resultElement[y as keyof FileStoreResult] as number);

        if (isUndefined(resultElement.result)) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.MISSING_RESULT,
              message: `results element must have "${ParameterEnum.Result}" parameter`,
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

        if (isUndefined(resultElement.fraction_types)) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.MISSING_FRACTION_TYPES,
              message: `results element must have "${ParameterEnum.FractionTypes}" parameter`,
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
              title: ErTitleEnum.DUPLICATE_RESULTS,
              message: `"${ParameterEnum.Result}" value must be unique across results elements`,
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

        let reg2 = MyRegex.CAPTURE_NOT_ALLOWED_RESULT_CHARS_G();
        let r2;

        while ((r2 = reg2.exec(result.resultName))) {
          resultWrongChars.push(r2[1]);
        }

        let resultWrongCharsString = '';

        if (resultWrongChars.length > 0) {
          resultWrongCharsString = [...new Set(resultWrongChars)].join(', '); // unique

          item.errors.push(
            new BmError({
              title: ErTitleEnum.WRONG_CHARS_IN_RESULT,
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Stores, newStores);

  return newStores;
}
