import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';

let func = enums.FuncEnum.CheckDefaultFilters;

export function checkDefaultFilters(item: {
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
      if (helper.isUndefined(report.default_filters)) {
        return;
      }

      let model = item.models.find(m => m.name === report.model);

      Object.keys(report.default_filters)
        .filter(k => !k.match(api.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(defaultFilter => {
          let reg = api.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_AND_WHITESPACES_G();
          let r = reg.exec(defaultFilter);

          if (helper.isUndefined(r)) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_DEFAULT_FILTER_WRONG_REFERENCE,
                message: 'default filter must be in form "alias.field_name"',
                lines: [
                  {
                    line: (<any>report.default_filters)[
                      defaultFilter + constants.LINE_NUM
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

          if (asName === constants.MF) {
            let modelField = model.fields.find(
              mField => mField.name === fieldName
            );

            if (helper.isUndefined(modelField)) {
              item.errors.push(
                new BmError({
                  title:
                    enums.ErTitleEnum
                      .REPORT_DEFAULT_FILTER_REFS_MISSING_MODEL_FIELD,
                  message:
                    `"${defaultFilter}" references missing or not valid field ` +
                    `"${fieldName}" of model "${model.name}" fields section`,
                  lines: [
                    {
                      line: (<any>report.default_filters)[
                        defaultFilter + constants.LINE_NUM
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
              item.errors.push(
                new BmError({
                  title:
                    enums.ErTitleEnum.REPORT_DEFAULT_FILTER_REFS_MISSING_ALIAS,
                  message:
                    `"${defaultFilter}" references missing alias ` +
                    `"${asName}" of model "${model.name}" joins section`,
                  lines: [
                    {
                      line: (<any>report.default_filters)[
                        defaultFilter + constants.LINE_NUM
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
              item.errors.push(
                new BmError({
                  title:
                    enums.ErTitleEnum
                      .REPORT_DEFAULT_FILTER_REFS_MISSING_VIEW_FIELD,
                  message:
                    `"${defaultFilter}" references missing or not valid field ` +
                    `"${fieldName}" of view "${join.view.name}". ` +
                    `View has "${asName}" alias in "${model.name}" model.`,
                  lines: [
                    {
                      line: (<any>report.default_filters)[
                        defaultFilter + constants.LINE_NUM
                      ],
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }

            if (helper.isDefined(report.listen[defaultFilter])) {
              item.errors.push(
                new BmError({
                  title:
                    enums.ErTitleEnum
                      .REPORT_SAME_FIELD_IN_DEFAULT_AND_LISTEN_FILTERS,
                  message: `found "${defaultFilter}" in default and listen filters at the same time`,
                  lines: [
                    {
                      line: (<any>report.default_filters)[
                        defaultFilter + constants.LINE_NUM
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
