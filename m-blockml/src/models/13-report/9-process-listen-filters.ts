import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';

let func = enums.FuncEnum.ProcessListenFilters;

export function processListenFilters(item: {
  dashboards: interfaces.Dashboard[];
  models: interfaces.Model[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newDashboards: interfaces.Dashboard[] = [];

  item.dashboards.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.reports.forEach(report => {
      report.listen = {};

      if (helper.isUndefined(report.listen_filters)) {
        return;
      }

      let model = item.models.find(m => m.name === report.model);

      Object.keys(report.listen_filters)
        .filter(k => !k.match(api.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(filterName => {
          let dashboardField = x.fields.find(f => f.name === filterName);

          if (helper.isUndefined(dashboardField)) {
            // error e91
            item.errors.push(
              new BmError({
                title:
                  enums.ErTitleEnum.REPORT_LISTENS_MISSING_DASHBOARD_FILTER,
                message:
                  `report listens ${api.FileExtensionEnum.Dashboard} filter "${filterName}" ` +
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
            let reg = api.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_AND_WHITESPACES_G();
            let r = reg.exec(part);

            if (helper.isUndefined(r)) {
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

              if (helper.isUndefined(modelField)) {
                // error e93
                item.errors.push(
                  new BmError({
                    title: enums.ErTitleEnum.REPORT_WRONG_LISTENER_MODEL_FILTER,
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

              if (helper.isDefined(report.listen[listener])) {
                // error e94
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
                // error e95
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

              if (helper.isUndefined(join)) {
                // error e96
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

              if (helper.isUndefined(viewField)) {
                // error e97
                item.errors.push(
                  new BmError({
                    title: enums.ErTitleEnum.REPORT_WRONG_LISTENER_VIEW_FILTER,
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

              if (helper.isDefined(report.listen[listener])) {
                // error e98
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
                // error e99
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
      newDashboards.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Ds, newDashboards);

  return newDashboards;
}
