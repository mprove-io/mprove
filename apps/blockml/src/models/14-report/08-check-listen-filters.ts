import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckListenFilters;

export function checkListenFilters<T extends types.dzType>(
  item: {
    entities: T[];
    models: interfaces.Model[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.reports.forEach(report => {
      report.listen = {};

      if (common.isUndefined(report.listen_filters)) {
        report.listen_filters = {};
        return;
      }

      if (
        common.isDefined(report.listen_filters) &&
        x.fileExt === common.FileExtensionEnum.Viz
      ) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.VIZ_REPORT_CAN_NOT_HAVE_LISTEN_FILTERS,
            message:
              `${common.FileExtensionEnum.Viz} does not support ` +
              `"${enums.ParameterEnum.ListenFilters}" parameter for reports`,
            lines: [
              {
                line:
                  report[
                    enums.ParameterEnum.ListenFilters + constants.LINE_NUM
                  ],
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      let model = item.models.find(m => m.name === report.model);

      Object.keys(report.listen_filters)
        .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(filterName => {
          let dashboardField = (<interfaces.Dashboard>x).fields.find(
            f => f.name === filterName
          );

          if (common.isUndefined(dashboardField)) {
            item.errors.push(
              new BmError({
                title:
                  enums.ErTitleEnum.REPORT_LISTENS_MISSING_DASHBOARD_FILTER,
                message:
                  `report listens ${common.FileExtensionEnum.Dashboard} filter "${filterName}" ` +
                  'that is missing or not valid',
                lines: [
                  {
                    line: (<any>report.listen_filters)[
                      filterName + constants.LINE_NUM
                    ],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          report.listen_filters[filterName].split(',').forEach(part => {
            let reg = common.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_AND_WHITESPACES_G();
            let r = reg.exec(part);

            if (common.isUndefined(r)) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.REPORT_WRONG_LISTENER,
                  message:
                    `Listener "${part}" is not valid.` +
                    'Listeners must be in form "alias.field_name" ' +
                    '(one or more separated by comma)',
                  lines: [
                    {
                      line: (<any>report.listen_filters)[
                        filterName + constants.LINE_NUM
                      ],
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }

            let asName = r[1];
            let fieldName = r[2];
            let listener = `${asName}.${fieldName}`;

            if (asName === constants.MF) {
              let modelField = model.fields.find(
                mField => mField.name === fieldName
              );

              if (common.isUndefined(modelField)) {
                item.errors.push(
                  new BmError({
                    title: enums.ErTitleEnum.REPORT_WRONG_LISTENER_MODEL_FIELD,
                    message:
                      `found listener "${listener}" references missing or not valid ` +
                      `field "${fieldName}" of model "${model.name}" fields section`,
                    lines: [
                      {
                        line: (<any>report.listen_filters)[
                          filterName + constants.LINE_NUM
                        ],
                        name: x.fileName,
                        path: x.filePath
                      }
                    ]
                  })
                );
                return;
              }

              if (common.isDefined(report.listen[listener])) {
                item.errors.push(
                  new BmError({
                    title:
                      enums.ErTitleEnum
                        .REPORT_MODEL_FIELD_LISTENS_MORE_THAN_ONE_FILTER,
                    message: `listener "${listener}" can not listen more than one filter`,
                    lines: [
                      {
                        line: report.listen_filters_line_num,
                        name: x.fileName,
                        path: x.filePath
                      }
                    ]
                  })
                );
                return;
              }

              if (dashboardField.result !== modelField.result) {
                item.errors.push(
                  new BmError({
                    title:
                      enums.ErTitleEnum
                        .REPORT_FILTER_AND_MODEL_FIELD_RESULTS_MISMATCH,
                    message:
                      `"${filterName}" filter result "${dashboardField.result}" does not match ` +
                      `listener "${listener}" result "${modelField.result}"`,
                    lines: [
                      {
                        line: (<any>report.listen_filters)[
                          filterName + constants.LINE_NUM
                        ],
                        name: x.fileName,
                        path: x.filePath
                      }
                    ]
                  })
                );
                return;
              }
            } else {
              let join = model.joins.find(j => j.as === asName);

              if (common.isUndefined(join)) {
                item.errors.push(
                  new BmError({
                    title: enums.ErTitleEnum.REPORT_WRONG_LISTENER_ALIAS,
                    message:
                      `found listener "${listener}" references missing alias ` +
                      `"${asName}" in joins section of model "${model.name}"`,
                    lines: [
                      {
                        line: (<any>report.listen_filters)[
                          filterName + constants.LINE_NUM
                        ],
                        name: x.fileName,
                        path: x.filePath
                      }
                    ]
                  })
                );
                return;
              }

              let viewField = join.view.fields.find(
                vField => vField.name === fieldName
              );

              if (common.isUndefined(viewField)) {
                item.errors.push(
                  new BmError({
                    title: enums.ErTitleEnum.REPORT_WRONG_LISTENER_VIEW_FIELD,
                    message:
                      `found listener "${listener}" references missing or not valid ` +
                      `field "${fieldName}" of view "${join.view.name}" fields section. ` +
                      `View has "${asName}" alias in "${model.name}" model.`,
                    lines: [
                      {
                        line: (<any>report.listen_filters)[
                          filterName + constants.LINE_NUM
                        ],
                        name: x.fileName,
                        path: x.filePath
                      }
                    ]
                  })
                );
                return;
              }

              if (common.isDefined(report.listen[listener])) {
                item.errors.push(
                  new BmError({
                    title:
                      enums.ErTitleEnum
                        .REPORT_VIEW_FIELD_LISTENS_MORE_THAN_ONE_FILTER,
                    message: `listener "${listener}" can not listen more than one filter`,
                    lines: [
                      {
                        line: report.listen_filters_line_num,
                        name: x.fileName,
                        path: x.filePath
                      }
                    ]
                  })
                );
                return;
              }

              if (dashboardField.result !== viewField.result) {
                item.errors.push(
                  new BmError({
                    title:
                      enums.ErTitleEnum
                        .REPORT_FILTER_AND_VIEW_FIELD_RESULTS_MISMATCH,
                    message:
                      `"${filterName}" filter result "${dashboardField.result}" does not match ` +
                      `listener "${listener}" result "${viewField.result}"`,
                    lines: [
                      {
                        line: (<any>report.listen_filters)[
                          filterName + constants.LINE_NUM
                        ],
                        name: x.fileName,
                        path: x.filePath
                      }
                    ]
                  })
                );
                return;
              }
            }

            report.listen[listener] = filterName;
          });
        });
    });

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(
    cs,
    caller,
    func,
    structId,
    enums.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}
