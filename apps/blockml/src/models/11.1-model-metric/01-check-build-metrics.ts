import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckBuildMetrics;

export function checkBuildMetrics(
  item: {
    models: common.FileModel[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newModels: common.FileModel[] = [];

  item.models.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (common.isDefined(x.build_metrics)) {
      x.build_metrics.forEach(bm =>
        Object.keys(bm)
          .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
          .forEach(parameter => {
            if ([common.ParameterEnum.Time.toString()].indexOf(parameter) < 0) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.BUILD_METRICS_UNKNOWN_PARAMETER,
                  message:
                    `parameter "${parameter}" can not be used ` +
                    `with "${common.ParameterEnum.BuildMetrics}"`,
                  lines: [
                    {
                      line: (bm as any)[
                        parameter + constants.LINE_NUM
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
              Array.isArray(bm[parameter as keyof common.FileBuildMetricsTime])
            ) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.TIME_UNEXPECTED_LIST,
                  message: `parameter '${parameter}' must have a single value`,
                  lines: [
                    {
                      line: (bm as any)[
                        parameter + constants.LINE_NUM
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
              bm[parameter as keyof common.FileBuildMetricsTime]
                ?.constructor === Object
            ) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.TIME_UNEXPECTED_DICTIONARY,
                  message: `parameter '${parameter}' must have a single value`,
                  lines: [
                    {
                      line: (bm as any)[
                        parameter + constants.LINE_NUM
                      ] as number,
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }

            // let part = bm[common.TimeframeEnum.Time];

            // let reg =
            //   common.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_AND_WHITESPACES_G();
            // let r = reg.exec(part);

            // if (common.isUndefined(r)) {
            //   item.errors.push(
            //     new BmError({
            //       title: common.ErTitleEnum.REPORT_WRONG_LISTENER,
            //       message:
            //         `Listener "${part}" is not valid.` +
            //         'Listeners must be in form "alias.field_name" ' +
            //         '(one or more separated by comma)',
            //       lines: [
            //         {
            //           line: (<any>report.listen_filters)[
            //             filterName + constants.LINE_NUM
            //           ],
            //           name: x.fileName,
            //           path: x.filePath
            //         }
            //       ]
            //     })
            //   );
            //   return;
            // }

            // let asName = r[1];
            // let fieldName = r[2];
            // let listener = `${asName}.${fieldName}`;

            // if (asName === constants.MF) {
            //   let modelField = model.fields.find(
            //     mField => mField.name === fieldName
            //   );

            //   if (common.isUndefined(modelField)) {
            //     item.errors.push(
            //       new BmError({
            //         title: common.ErTitleEnum.REPORT_WRONG_LISTENER_MODEL_FIELD,
            //         message:
            //           `found listener "${listener}" references missing or not valid ` +
            //           `field "${fieldName}" of model "${model.name}" fields section`,
            //         lines: [
            //           {
            //             line: (<any>report.listen_filters)[
            //               filterName + constants.LINE_NUM
            //             ],
            //             name: x.fileName,
            //             path: x.filePath
            //           }
            //         ]
            //       })
            //     );
            //     return;
            //   }

            //   if (common.isDefined(report.listen[listener])) {
            //     item.errors.push(
            //       new BmError({
            //         title:
            //           common.ErTitleEnum
            //             .REPORT_MODEL_FIELD_LISTENS_MORE_THAN_ONE_FILTER,
            //         message: `listener "${listener}" can not listen more than one filter`,
            //         lines: [
            //           {
            //             line: report.listen_filters_line_num,
            //             name: x.fileName,
            //             path: x.filePath
            //           }
            //         ]
            //       })
            //     );
            //     return;
            //   }

            //   if (dashboardField.result !== modelField.result) {
            //     item.errors.push(
            //       new BmError({
            //         title:
            //           common.ErTitleEnum
            //             .REPORT_FILTER_AND_MODEL_FIELD_RESULTS_MISMATCH,
            //         message:
            //           `"${filterName}" filter result "${dashboardField.result}" does not match ` +
            //           `listener "${listener}" result "${modelField.result}"`,
            //         lines: [
            //           {
            //             line: (<any>report.listen_filters)[
            //               filterName + constants.LINE_NUM
            //             ],
            //             name: x.fileName,
            //             path: x.filePath
            //           }
            //         ]
            //       })
            //     );
            //     return;
            //   }
            // } else {
            //   let join = model.joins.find(j => j.as === asName);

            //   if (common.isUndefined(join)) {
            //     item.errors.push(
            //       new BmError({
            //         title: common.ErTitleEnum.REPORT_WRONG_LISTENER_ALIAS,
            //         message:
            //           `found listener "${listener}" references missing alias ` +
            //           `"${asName}" in joins section of model "${model.name}"`,
            //         lines: [
            //           {
            //             line: (<any>report.listen_filters)[
            //               filterName + constants.LINE_NUM
            //             ],
            //             name: x.fileName,
            //             path: x.filePath
            //           }
            //         ]
            //       })
            //     );
            //     return;
            //   }

            //   let viewField = join.view.fields.find(
            //     vField => vField.name === fieldName
            //   );

            //   if (common.isUndefined(viewField)) {
            //     item.errors.push(
            //       new BmError({
            //         title: common.ErTitleEnum.REPORT_WRONG_LISTENER_VIEW_FIELD,
            //         message:
            //           `found listener "${listener}" references missing or not valid ` +
            //           `field "${fieldName}" of view "${join.view.name}" fields section. ` +
            //           `View has "${asName}" alias in "${model.name}" model.`,
            //         lines: [
            //           {
            //             line: (<any>report.listen_filters)[
            //               filterName + constants.LINE_NUM
            //             ],
            //             name: x.fileName,
            //             path: x.filePath
            //           }
            //         ]
            //       })
            //     );
            //     return;
            //   }

            //   if (common.isDefined(report.listen[listener])) {
            //     item.errors.push(
            //       new BmError({
            //         title:
            //           common.ErTitleEnum
            //             .REPORT_VIEW_FIELD_LISTENS_MORE_THAN_ONE_FILTER,
            //         message: `listener "${listener}" can not listen more than one filter`,
            //         lines: [
            //           {
            //             line: report.listen_filters_line_num,
            //             name: x.fileName,
            //             path: x.filePath
            //           }
            //         ]
            //       })
            //     );
            //     return;
            //   }

            //   if (dashboardField.result !== viewField.result) {
            //     item.errors.push(
            //       new BmError({
            //         title:
            //           common.ErTitleEnum
            //             .REPORT_FILTER_AND_VIEW_FIELD_RESULTS_MISMATCH,
            //         message:
            //           `"${filterName}" filter result "${dashboardField.result}" does not match ` +
            //           `listener "${listener}" result "${viewField.result}"`,
            //         lines: [
            //           {
            //             line: (<any>report.listen_filters)[
            //               filterName + constants.LINE_NUM
            //             ],
            //             name: x.fileName,
            //             path: x.filePath
            //           }
            //         ]
            //       })
            //     );
            //     return;
            //   }
            // }

            // report.listen[listener] = filterName;
          })
      );
    }

    if (errorsOnStart === item.errors.length) {
      newModels.push(x);
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
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Models, newModels);

  return newModels;
}
