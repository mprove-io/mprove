import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckRepRowUnknownParams;

export function checkRepRowUnknownParams(
  item: {
    reps: common.FileRep[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newReps: common.FileRep[] = [];

  item.reps.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.rows
      .filter(row => common.isDefined(row.parameters))
      .forEach(row => {
        row.parameters.forEach(param => {
          Object.keys(param)
            .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
            .forEach(parameter => {
              if (
                [
                  common.ParameterEnum.Filter.toString(),
                  common.ParameterEnum.Conditions.toString(),
                  common.ParameterEnum.Formula.toString()
                ].indexOf(parameter) < 0
              ) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.UNKNOWN_PARAMETER,
                    message: `parameter "${parameter}" can not be used inside Parameter`,
                    lines: [
                      {
                        line: param[
                          (parameter +
                            constants.LINE_NUM) as keyof common.FileRepRowParameter
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
                [common.ParameterEnum.Conditions.toString()].indexOf(
                  parameter
                ) < 0 &&
                Array.isArray(
                  param[parameter as keyof common.FileRepRowParameter]
                )
              ) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.UNEXPECTED_LIST_IN_PARAMETERS,
                    message: `parameter "${parameter}" can not be a list`,
                    lines: [
                      {
                        line: param[
                          (parameter +
                            constants.LINE_NUM) as keyof common.FileRepRowParameter
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
                param[parameter as keyof common.FileRepRowParameter]
                  ?.constructor === Object
                //  &&
                // [
                //   common.ParameterEnum.Formula.toString()
                // ].indexOf(parameter) < 0
              ) {
                item.errors.push(
                  new BmError({
                    title:
                      common.ErTitleEnum.UNEXPECTED_DICTIONARY_IN_PARAMETERS,
                    message: `parameter "${parameter}" can not be a dictionary`,
                    lines: [
                      {
                        line: param[
                          (parameter +
                            constants.LINE_NUM) as keyof common.FileRepRowParameter
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
                [common.ParameterEnum.Conditions.toString()].indexOf(
                  parameter
                ) > -1 &&
                !Array.isArray(
                  param[parameter as keyof common.FileRepRowParameter]
                )
              ) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.PARAMETER_MUST_BE_A_LIST,
                    message: `parameter "${parameter}" must be a list`,
                    lines: [
                      {
                        line: param[
                          (parameter +
                            constants.LINE_NUM) as keyof common.FileRepRowParameter
                        ] as number,
                        name: x.fileName,
                        path: x.filePath
                      }
                    ]
                  })
                );
                return;
              }

              // if (
              //   common.isDefined(param[parameter as keyof common.FileRepRowParameter]) &&
              //   param[parameter as keyof common.FileRepRowParameter].constructor !== Object &&
              //   [
              //     common.ParameterEnum.Axis.toString()
              //   ].indexOf(parameter) > -1
              // ) {
              //   item.errors.push(
              //     new BmError({
              //       title: common.ErTitleEnum.PARAMETER_MUST_BE_A_DICTIONARY,
              //       message: `parameter "${parameter}" must be a dictionary`,
              //       lines: [
              //         {
              //           line: param[
              //             (parameter +
              //               constants.LINE_NUM) as keyof common.FileRepRowParameter
              //           ] as number,
              //           name: x.fileName,
              //           path: x.filePath
              //         }
              //       ]
              //     })
              //   );
              //   return;
              // }
            });
        });
      });

    if (errorsOnStart === item.errors.length) {
      newReps.push(x);
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
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Entities, newReps);

  return newReps;
}
