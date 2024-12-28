import { ConfigService } from '@nestjs/config';
import { barSpecial } from '~blockml/barrels/bar-special';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckReportRowParameters;

export function checkReportRowParameters(
  item: {
    caseSensitiveStringFilters: boolean;
    reports: common.FileReport[];
    metrics: common.MetricAny[];
    models: common.FileModel[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId, metrics, models, caseSensitiveStringFilters } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newReports: common.FileReport[] = [];

  item.reports.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.rows
      .filter(row => common.isDefined(row.parameters))
      .forEach(row => {
        let pFilterMaps: Array<{ filter: string; lineNumbers: number[] }> = [];

        row.parameters.forEach(p => {
          let pFilterMap = pFilterMaps.find(
            element => element.filter === p.filter
          );

          if (pFilterMap) {
            pFilterMap.lineNumbers.push(p.filter_line_num);
          } else {
            pFilterMaps.push({
              filter: p.filter,
              lineNumbers: [p.filter_line_num]
            });
          }
        });

        pFilterMaps.forEach(n => {
          if (n.lineNumbers.length > 1) {
            let lines: common.FileErrorLine[] = n.lineNumbers.map(y => ({
              line: y,
              name: x.fileName,
              path: x.filePath
            }));

            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.DUPLICATE_FILTERS,
                message: 'Row filters must be unique',
                lines: lines
              })
            );
            return;
          }
        });
      });

    if (errorsOnStart === item.errors.length) {
      x.rows
        .filter(
          row =>
            row.type === common.RowTypeEnum.Metric &&
            common.isDefined(row.parameters)
        )
        .forEach(row => {
          let metric = metrics.find(m => m.metricId === row.metric);
          let model = models.find(y => y.name === metric.modelId);

          row.parameters
            .filter(p => common.isDefined(p.filter))
            .forEach(p => {
              let reg =
                common.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_AND_WHITESPACES_G();
              let r = reg.exec(p.filter);

              if (common.isUndefined(r)) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.ROW_FILTER_WRONG_REFERENCE,
                    message: 'row filter must be in form "alias.field_name"',
                    lines: [
                      {
                        line: p.filter_line_num,
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

                if (common.isUndefined(modelField)) {
                  item.errors.push(
                    new BmError({
                      title:
                        common.ErTitleEnum.ROW_FILTER_REFS_MISSING_MODEL_FIELD,
                      message:
                        `"${p.filter}" references missing or not valid field ` +
                        `"${fieldName}" of model "${model.name}" fields section`,
                      lines: [
                        {
                          line: p.filter_line_num,
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
                      title: common.ErTitleEnum.ROW_FILTER_REFS_MISSING_ALIAS,
                      message:
                        `"${p.filter}" references missing alias ` +
                        `"${asName}" of model "${model.name}" joins section`,
                      lines: [
                        {
                          line: p.filter_line_num,
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
                      title:
                        common.ErTitleEnum.ROW_FILTER_REFS_MISSING_VIEW_FIELD,
                      message:
                        `"${p.filter}" references missing or not valid field ` +
                        `"${fieldName}" of view "${join.view.name}". ` +
                        `View has "${asName}" alias in "${model.name}" model.`,
                      lines: [
                        {
                          line: p.filter_line_num,
                          name: x.fileName,
                          path: x.filePath
                        }
                      ]
                    })
                  );
                  return;
                }
              }

              if (common.isDefined(p.listen) && common.isDefined(p.formula)) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.ROW_PARAMETER_WRONG_COMBINATION,
                    message: `found that both parameters "formula" and "listen" are specified`,
                    lines: [
                      {
                        line: p.filter_line_num,
                        name: x.fileName,
                        path: x.filePath
                      }
                    ]
                  })
                );
                return;
              }

              if (
                common.isDefined(p.listen) &&
                common.isDefined(p.conditions)
              ) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.ROW_PARAMETER_WRONG_COMBINATION,
                    message: `found that both parameters "conditions" and "listen" are specified`,
                    lines: [
                      {
                        line: p.filter_line_num,
                        name: x.fileName,
                        path: x.filePath
                      }
                    ]
                  })
                );
                return;
              }

              if (
                common.isDefined(p.formula) &&
                common.isDefined(p.conditions)
              ) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.ROW_PARAMETER_WRONG_COMBINATION,
                    message: `found that both parameters "formula" and "conditions" are specified`,
                    lines: [
                      {
                        line: p.filter_line_num,
                        name: x.fileName,
                        path: x.filePath
                      }
                    ]
                  })
                );
                return;
              }

              let pResult =
                asName === constants.MF
                  ? model.fields.find(mField => mField.name === fieldName)
                      .result
                  : model.joins
                      .find(j => j.as === asName)
                      .view.fields.find(vField => vField.name === fieldName)
                      .result;

              if (common.isDefined(p.conditions)) {
                if (p.conditions.length === 0) {
                  item.errors.push(
                    new BmError({
                      title: common.ErTitleEnum.ROW_FILTER_CONDITIONS_IS_EMPTY,
                      message: `filter contidions can not be empty`,
                      lines: [
                        {
                          line: p.conditions_line_num,
                          name: x.fileName,
                          path: x.filePath
                        }
                      ]
                    })
                  );
                  return;
                }

                let pf = barSpecial.processFilter({
                  caseSensitiveStringFilters: caseSensitiveStringFilters,
                  filterBricks: p.conditions,
                  result: pResult
                });

                if (pf.valid === 0) {
                  item.errors.push(
                    new BmError({
                      title: common.ErTitleEnum.ROW_FILTER_WRONG_CONDITIONS,
                      message:
                        `wrong expression "${pf.brick}" of filter "${p.filter}" ` +
                        `for ${common.ParameterEnum.Result} "${pResult}" `,
                      lines: [
                        {
                          line: p.conditions_line_num,
                          name: x.fileName,
                          path: x.filePath
                        }
                      ]
                    })
                  );
                  return;
                }
              }

              if (common.isDefined(p.listen)) {
                let reportField = x.fields.find(f => f.name === p.listen);

                if (common.isUndefined(reportField)) {
                  item.errors.push(
                    new BmError({
                      title:
                        common.ErTitleEnum
                          .ROW_PARAMETER_LISTENS_TO_MISSING_REPORT_FILTER,
                      message:
                        `row parameter listens report filter "${p.listen}" ` +
                        'that is missing or not valid',
                      lines: [
                        {
                          line: p.listen_line_num,
                          name: x.fileName,
                          path: x.filePath
                        }
                      ]
                    })
                  );
                  return;
                } else if (reportField.result !== pResult) {
                  item.errors.push(
                    new BmError({
                      title:
                        common.ErTitleEnum
                          .ROW_PARAMETER_AND_LISTEN_RESULT_MISMATCH,
                      message:
                        `"${p.listen}" result "${reportField.result}" does not match ` +
                        `listener "${p.filter}" result "${pResult}"`,
                      lines: [
                        {
                          line: p.listen_line_num,
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
    }

    if (errorsOnStart === item.errors.length) {
      newReports.push(x);
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
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Entities,
    newReports
  );

  return newReports;
}
