import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckRepRowParameters;

export function checkRepRowParameters(
  item: {
    reps: common.FileRep[];
    metrics: common.MetricAny[];
    models: common.FileModel[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId, metrics, models } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newReps: common.FileRep[] = [];

  item.reps.forEach(x => {
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
        .filter(row => common.isDefined(row.parameters))
        .forEach(row => {
          let metric = metrics.find(m => m.metricId === row.metric);
          let model = models.find(y => y.model === metric.modelId);

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

                //   let viewField = join.view.fields.find(
                //     vField => vField.name === fieldName
                //   );

                //   if (common.isUndefined(viewField)) {
                //     item.errors.push(
                //       new BmError({
                //         title:
                //           common.ErTitleEnum
                //             .REPORT_DEFAULT_FILTER_REFS_MISSING_VIEW_FIELD,
                //         message:
                //           `"${defaultFilter}" references missing or not valid field ` +
                //           `"${fieldName}" of view "${join.view.name}". ` +
                //           `View has "${asName}" alias in "${model.name}" model.`,
                //         lines: [
                //           {
                //             line: (<any>report.default_filters)[
                //               defaultFilter + constants.LINE_NUM
                //             ],
                //             name: x.fileName,
                //             path: x.filePath
                //           }
                //         ]
                //       })
                //     );
                //     return;
                //   }
              }
            });
        });
    }

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
