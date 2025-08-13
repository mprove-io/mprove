import { ConfigService } from '@nestjs/config';
import { barSpecial } from '~blockml/barrels/bar-special';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';
import { STORE_MODEL_PREFIX } from '~common/_index';
import { bricksToFractions } from '~node-common/functions/bricks-to-fractions';

let func = common.FuncEnum.CheckReportRowParameters;

export function checkReportRowParameters(
  item: {
    caseSensitiveStringFilters: boolean;
    reports: common.FileReport[];
    metrics: common.ModelMetric[];
    models: common.FileModel[];
    apiModels: common.Model[];
    stores: common.FileStore[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let {
    caller,
    structId,
    metrics,
    models,
    apiModels,
    stores,
    caseSensitiveStringFilters
  } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newReports: common.FileReport[] = [];

  item.reports.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.rows
      .filter(row => common.isDefined(row.parameters))
      .forEach(row => {
        row.parameters.forEach(p => {
          let pKeysLineNums: number[] = Object.keys(p)
            .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
            .map(y => p[y as keyof common.FileReportRowParameter] as number);

          if (common.isUndefined(p.apply_to)) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.MISSING_APPLY_TO,
                message: `parameter "${common.ParameterEnum.ApplyTo}" is required`,
                lines: [
                  {
                    line: Math.min(...pKeysLineNums),
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          let store;

          let isStore = false;

          let metric = metrics.find(m => m.metricId === row.metric);

          isStore = metric?.modelType === common.ModelTypeEnum.Store;

          if (
            isStore === false &&
            common.isUndefined(p.listen) &&
            common.isUndefined(p.conditions)
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.MISSING_LISTEN_OR_CONDITIONS,
                message:
                  `"${common.ParameterEnum.Listen}" or ` +
                  `"${common.ParameterEnum.Conditions}" must be specified for a row parameter`,
                lines: [
                  {
                    line: Math.min(...pKeysLineNums),
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            isStore === true &&
            common.isUndefined(p.listen) &&
            common.isUndefined(p.fractions)
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.MISSING_LISTEN_OR_FRACTIONS,
                message:
                  `"${common.ParameterEnum.Listen}" or ` +
                  `"${common.ParameterEnum.Conditions}" must be specified for a tile parameter`,
                lines: [
                  {
                    line: Math.min(...pKeysLineNums),
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }
        });

        let pApplyToMaps: Array<{ applyTo: string; lineNumbers: number[] }> =
          [];

        row.parameters.forEach(p => {
          let pApplyToMap = pApplyToMaps.find(
            element => element.applyTo === p.apply_to
          );

          if (pApplyToMap) {
            pApplyToMap.lineNumbers.push(p.apply_to_line_num);
          } else {
            pApplyToMaps.push({
              applyTo: p.apply_to,
              lineNumbers: [p.apply_to_line_num]
            });
          }
        });

        pApplyToMaps.forEach(n => {
          if (n.lineNumbers.length > 1) {
            let lines: common.FileErrorLine[] = n.lineNumbers.map(y => ({
              line: y,
              name: x.fileName,
              path: x.filePath
            }));

            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.DUPLICATE_APPLY_TO,
                message: 'Row parameter apply_to must be unique',
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

          let isStore = metric?.modelType === common.ModelTypeEnum.Store;

          let store: common.FileStore;

          if (isStore === true) {
            store = stores.find(
              m => `${STORE_MODEL_PREFIX}_${m.name}` === row.model
            );
          }

          row.parameters
            .filter(p => common.isDefined(p.apply_to))
            .forEach(p => {
              let reportField;

              if (common.isDefined(p.listen)) {
                reportField = x.fields.find(f => f.name === p.listen);

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
                }
              }

              if (metric?.modelType === common.ModelTypeEnum.SQL) {
                let model = models.find(y => y.name === metric.modelId);

                let reg =
                  common.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_AND_WHITESPACES_G();

                let r = reg.exec(p.apply_to);

                if (common.isUndefined(r)) {
                  item.errors.push(
                    new BmError({
                      title: common.ErTitleEnum.APPLY_TO_WRONG_REFERENCE,
                      message:
                        'row apply_to must be in form "alias.field_name"',
                      lines: [
                        {
                          line: p.apply_to_line_num,
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

                if (asName === common.MF) {
                  let modelField = model.fields.find(
                    mField => mField.name === fieldName
                  );

                  if (common.isUndefined(modelField)) {
                    item.errors.push(
                      new BmError({
                        title:
                          common.ErTitleEnum.APPLY_TO_REFS_MISSING_MODEL_FIELD,
                        message:
                          `"${p.apply_to}" references missing or not valid field ` +
                          `"${fieldName}" of model "${model.name}" fields section`,
                        lines: [
                          {
                            line: p.apply_to_line_num,
                            name: x.fileName,
                            path: x.filePath
                          }
                        ]
                      })
                    );
                    return;
                  }

                  p.notStoreApplyToResult = modelField.result;
                } else {
                  let join = model.joins.find(j => j.as === asName);

                  if (common.isUndefined(join)) {
                    item.errors.push(
                      new BmError({
                        title: common.ErTitleEnum.APPLY_TO_REFS_MISSING_ALIAS,
                        message:
                          `"${p.apply_to}" references missing alias ` +
                          `"${asName}" of model "${model.name}" joins section`,
                        lines: [
                          {
                            line: p.apply_to_line_num,
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
                          common.ErTitleEnum.APPLY_TO_REFS_MISSING_VIEW_FIELD,
                        message:
                          `"${p.apply_to}" references missing or not valid field ` +
                          `"${fieldName}" of view "${join.view.name}". ` +
                          `View has "${asName}" alias in "${model.name}" model.`,
                        lines: [
                          {
                            line: p.apply_to_line_num,
                            name: x.fileName,
                            path: x.filePath
                          }
                        ]
                      })
                    );
                    return;
                  }

                  p.notStoreApplyToResult = viewField.result;
                }

                if (
                  common.isDefined(p.listen) &&
                  common.isDefined(p.conditions)
                ) {
                  item.errors.push(
                    new BmError({
                      title: common.ErTitleEnum.PARAMETER_WRONG_COMBINATION,
                      message: `found that both parameters "${common.ParameterEnum.Conditions}" and "${common.ParameterEnum.Listen}" are specified`,
                      lines: [
                        {
                          line: p.listen_line_num,
                          name: x.fileName,
                          path: x.filePath
                        },
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

                let pResult =
                  asName === common.MF
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
                        title: common.ErTitleEnum.APPLY_TO_CONDITIONS_IS_EMPTY,
                        message: `apply_to conditions cannot be empty`,
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
                        title: common.ErTitleEnum.APPLY_TO_WRONG_CONDITIONS,
                        message:
                          `wrong expression "${pf.brick}" of apply_to "${p.apply_to}" ` +
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
                  if (reportField.result !== pResult) {
                    item.errors.push(
                      new BmError({
                        title:
                          common.ErTitleEnum
                            .ROW_PARAMETER_AND_LISTEN_RESULT_MISMATCH,
                        message:
                          `"${p.listen}" result "${reportField.result}" does not match ` +
                          `listener "${p.apply_to}" result "${pResult}"`,
                        lines: [
                          {
                            line: p.apply_to_line_num,
                            name: x.fileName,
                            path: x.filePath
                          },
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
              }

              if (isStore === true) {
                let storeField = store.fields.find(
                  sField => sField.name === p.apply_to
                );

                if (common.isUndefined(storeField)) {
                  item.errors.push(
                    new BmError({
                      title:
                        common.ErTitleEnum.APPLY_TO_REFS_MISSING_STORE_FIELD,
                      message:
                        `"${p.apply_to}" references missing or not valid field ` +
                        `of store "${store.name}" fields section`,
                      lines: [
                        {
                          line: p.apply_to_line_num,
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
                  common.isDefined(p.fractions)
                ) {
                  item.errors.push(
                    new BmError({
                      title:
                        common.ErTitleEnum.PARAMETER_WRONG_COMBINATION_STORE,
                      message: `found that both parameters "${common.ParameterEnum.Fractions}" and "${common.ParameterEnum.Listen}" are specified`,
                      lines: [
                        {
                          line: p.listen_line_num,
                          name: x.fileName,
                          path: x.filePath
                        },
                        {
                          line: p.fractions_line_num,
                          name: x.fileName,
                          path: x.filePath
                        }
                      ]
                    })
                  );
                  return;
                }

                if (common.isDefined(p.fractions) && p.fractions.length === 0) {
                  item.errors.push(
                    new BmError({
                      title: common.ErTitleEnum.FRACTIONS_LIST_IS_EMPTY,
                      message: `fractions cannot be empty`,
                      lines: [
                        {
                          line: p.fractions_line_num,
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
                  common.isDefined(reportField.store_filter) &&
                  common.isDefined(storeField) &&
                  (storeField.fieldClass !== common.FieldClassEnum.Filter ||
                    storeField.name !== reportField.store_filter)
                ) {
                  item.errors.push(
                    new BmError({
                      title:
                        common.ErTitleEnum
                          .APPLY_TO_AND_LISTEN_STORE_FILTER_MISMATCH,
                      message: `apply_to must reference to the same store filter as it listens to`,
                      lines: [
                        {
                          line: p.apply_to_line_num,
                          name: x.fileName,
                          path: x.filePath
                        },
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

                if (
                  common.isDefined(p.listen) &&
                  common.isDefined(reportField.store_result) &&
                  common.isDefined(storeField) &&
                  storeField.result !== reportField.store_result
                ) {
                  item.errors.push(
                    new BmError({
                      title:
                        common.ErTitleEnum
                          .APPLY_TO_AND_LISTEN_STORE_RESULT_MISMATCH,
                      message: `apply_to must reference to a store field with the same result as it listens to`,
                      lines: [
                        {
                          line: p.apply_to_line_num,
                          name: x.fileName,
                          path: x.filePath
                        },
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

                let storeResult: common.FileStoreResult;

                if (storeField.fieldClass !== common.FieldClassEnum.Filter) {
                  storeResult = store.results.find(
                    sResult => sResult.result === storeField.result
                  );
                }

                if (common.isDefined(p.fractions)) {
                  if (
                    storeField.fieldClass === common.FieldClassEnum.Filter &&
                    common.isDefined(storeField.max_fractions) &&
                    p.fractions.length > Number(storeField.max_fractions)
                  ) {
                    item.errors.push(
                      new BmError({
                        title: common.ErTitleEnum.MAX_FRACTIONS_EXCEEDED,
                        message: `fractions length ${
                          p.fractions.length
                        } exceeded store filter max_fractions ${Number(
                          storeField.max_fractions
                        )}`,
                        lines: [
                          {
                            line: p.fractions_line_num,
                            name: x.fileName,
                            path: x.filePath
                          }
                        ]
                      })
                    );
                    return;
                  }

                  barSpecial.checkStoreFraction(
                    {
                      storeFilter:
                        storeField.fieldClass === common.FieldClassEnum.Filter
                          ? storeField
                          : undefined,
                      storeResult:
                        storeField.fieldClass === common.FieldClassEnum.Filter
                          ? undefined
                          : storeField.result,
                      storeFractionTypes: storeResult?.fraction_types,
                      fractions: p.fractions,
                      fractionsLineNum: p.fractions_line_num,
                      fileName: x.fileName,
                      filePath: x.filePath,
                      structId: item.structId,
                      errors: item.errors,
                      caller: item.caller
                    },
                    cs
                  );

                  if (errorsOnStart === item.errors.length) {
                    p.fractions.forEach(fraction => {
                      barSpecial.checkStoreFractionControls(
                        {
                          skipOptions: true,
                          controls: fraction.controls,
                          controlsLineNum: fraction.controls_line_num,
                          fileName: x.fileName,
                          filePath: x.filePath,
                          structId: item.structId,
                          errors: item.errors,
                          caller: item.caller
                        },
                        cs
                      );

                      if (errorsOnStart === item.errors.length) {
                        barSpecial.checkStoreFractionControlsUse(
                          {
                            controls: fraction.controls,
                            storeControls:
                              storeField.fieldClass ===
                              common.FieldClassEnum.Filter
                                ? storeField.fraction_controls
                                : storeResult.fraction_types.find(
                                    ft => ft.type === fraction.type
                                  ).controls,
                            controlsLineNum: fraction.controls_line_num,
                            fileName: x.fileName,
                            filePath: x.filePath,
                            structId: item.structId,
                            errors: item.errors,
                            caller: item.caller
                          },
                          cs
                        );
                      }
                    });
                  }
                }
              }

              if (metric?.modelType === common.ModelTypeEnum.Malloy) {
                let apiModel = item.apiModels.find(
                  y => y.modelId === metric.modelId
                );

                let modelField = apiModel.fields.find(x => x.id === p.apply_to);

                if (common.isUndefined(modelField)) {
                  item.errors.push(
                    new BmError({
                      title:
                        common.ErTitleEnum.APPLY_TO_REFS_MISSING_MODEL_FIELD,
                      message:
                        `"${p.apply_to}" references missing or not valid field ` +
                        `of model "${apiModel.modelId}"`,
                      lines: [
                        {
                          line: p.apply_to_line_num,
                          name: x.fileName,
                          path: x.filePath
                        }
                      ]
                    })
                  );
                  return;
                }

                p.notStoreApplyToResult = modelField.result;

                if (
                  common.isDefined(p.listen) &&
                  common.isDefined(p.conditions)
                ) {
                  item.errors.push(
                    new BmError({
                      title: common.ErTitleEnum.PARAMETER_WRONG_COMBINATION,
                      message: `found that both parameters "${common.ParameterEnum.Conditions}" and "${common.ParameterEnum.Listen}" are specified`,
                      lines: [
                        {
                          line: p.listen_line_num,
                          name: x.fileName,
                          path: x.filePath
                        },
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

                let pResult = modelField.result;

                if (common.isDefined(p.conditions)) {
                  if (p.conditions.length === 0) {
                    item.errors.push(
                      new BmError({
                        title: common.ErTitleEnum.APPLY_TO_CONDITIONS_IS_EMPTY,
                        message: `apply_to conditions cannot be empty`,
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

                  let pf = bricksToFractions({
                    filterBricks: p.conditions,
                    result: pResult,
                    getTimeRange: false
                    // timezone: timezone,
                    // weekStart: weekStart,
                    // timeSpec: timeSpec
                    // caseSensitiveStringFilters: caseSensitiveStringFilters,
                    // fractions: fractions,
                  });

                  if (pf.valid === 0) {
                    item.errors.push(
                      new BmError({
                        title: common.ErTitleEnum.APPLY_TO_WRONG_CONDITIONS,
                        message:
                          `wrong expression "${pf.brick}" of apply_to "${p.apply_to}" ` +
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
                  if (reportField.result !== pResult) {
                    item.errors.push(
                      new BmError({
                        title:
                          common.ErTitleEnum
                            .ROW_PARAMETER_AND_LISTEN_RESULT_MISMATCH,
                        message:
                          `"${p.listen}" result "${reportField.result}" does not match ` +
                          `listener "${p.apply_to}" result "${pResult}"`,
                        lines: [
                          {
                            line: p.apply_to_line_num,
                            name: x.fileName,
                            path: x.filePath
                          },
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
