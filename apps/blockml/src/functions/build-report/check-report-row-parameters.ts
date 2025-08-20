import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { ParameterEnum } from '~common/enums/docs/parameter.enum';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { RowTypeEnum } from '~common/enums/row-type.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { ErTitleEnum } from '~common/enums/special/er-title.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { FileErrorLine } from '~common/interfaces/blockml/internal/file-error-line';
import { FileReport } from '~common/interfaces/blockml/internal/file-report';
import { FileReportRowParameter } from '~common/interfaces/blockml/internal/file-report-row-parameter';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';
import { FileStoreResult } from '~common/interfaces/blockml/internal/file-store-result';
import { Model } from '~common/interfaces/blockml/model';
import { ModelMetric } from '~common/interfaces/blockml/model-metric';
import { MyRegex } from '~common/models/my-regex';
import { bricksToFractions } from '~node-common/functions/bricks-to-fractions';
import { checkStoreFraction } from '../extra/check-store-fraction';
import { checkStoreFractionControls } from '../extra/check-store-fraction-controls';
import { checkStoreFractionControlsUse } from '../extra/check-store-fraction-controls-use';
import { log } from '../extra/log';

let func = FuncEnum.CheckReportRowParameters;

export function checkReportRowParameters(
  item: {
    caseSensitiveStringFilters: boolean;
    reports: FileReport[];
    metrics: ModelMetric[];
    apiModels: Model[];
    stores: FileStore[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let {
    caller,
    structId,
    metrics,
    apiModels,
    stores,
    caseSensitiveStringFilters
  } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newReports: FileReport[] = [];

  item.reports.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.rows
      .filter(row => isDefined(row.parameters))
      .forEach(row => {
        row.parameters.forEach(p => {
          let pKeysLineNums: number[] = Object.keys(p)
            .filter(y => y.match(MyRegex.ENDS_WITH_LINE_NUM()))
            .map(y => p[y as keyof FileReportRowParameter] as number);

          if (isUndefined(p.apply_to)) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.MISSING_APPLY_TO,
                message: `parameter "${ParameterEnum.ApplyTo}" is required`,
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

          isStore = metric?.modelType === ModelTypeEnum.Store;

          if (
            isStore === false &&
            isUndefined(p.listen) &&
            isUndefined(p.conditions)
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.MISSING_LISTEN_OR_CONDITIONS,
                message:
                  `"${ParameterEnum.Listen}" or ` +
                  `"${ParameterEnum.Conditions}" must be specified for a row parameter`,
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
            isUndefined(p.listen) &&
            isUndefined(p.fractions)
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.MISSING_LISTEN_OR_FRACTIONS,
                message:
                  `"${ParameterEnum.Listen}" or ` +
                  `"${ParameterEnum.Conditions}" must be specified for a tile parameter`,
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
            let lines: FileErrorLine[] = n.lineNumbers.map(y => ({
              line: y,
              name: x.fileName,
              path: x.filePath
            }));

            item.errors.push(
              new BmError({
                title: ErTitleEnum.DUPLICATE_APPLY_TO,
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
          row => row.type === RowTypeEnum.Metric && isDefined(row.parameters)
        )
        .forEach(row => {
          let metric = metrics.find(m => m.metricId === row.metric);

          let isStore = metric?.modelType === ModelTypeEnum.Store;

          let store: FileStore;

          if (isStore === true) {
            store = stores.find(m => m.name === row.model);
          }

          row.parameters
            .filter(p => isDefined(p.apply_to))
            .forEach(p => {
              let reportField;

              if (isDefined(p.listen)) {
                reportField = x.fields.find(f => f.name === p.listen);

                if (isUndefined(reportField)) {
                  item.errors.push(
                    new BmError({
                      title:
                        ErTitleEnum.ROW_PARAMETER_LISTENS_TO_MISSING_REPORT_FILTER,
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

              if (isStore === true) {
                let storeField = store.fields.find(
                  sField => sField.name === p.apply_to
                );

                if (isUndefined(storeField)) {
                  item.errors.push(
                    new BmError({
                      title: ErTitleEnum.APPLY_TO_REFS_MISSING_STORE_FIELD,
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

                if (isDefined(p.listen) && isDefined(p.fractions)) {
                  item.errors.push(
                    new BmError({
                      title: ErTitleEnum.PARAMETER_WRONG_COMBINATION_STORE,
                      message: `found that both parameters "${ParameterEnum.Fractions}" and "${ParameterEnum.Listen}" are specified`,
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

                if (isDefined(p.fractions) && p.fractions.length === 0) {
                  item.errors.push(
                    new BmError({
                      title: ErTitleEnum.FRACTIONS_LIST_IS_EMPTY,
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
                  isDefined(p.listen) &&
                  isDefined(reportField.store_filter) &&
                  isDefined(storeField) &&
                  (storeField.fieldClass !== FieldClassEnum.Filter ||
                    storeField.name !== reportField.store_filter)
                ) {
                  item.errors.push(
                    new BmError({
                      title:
                        ErTitleEnum.APPLY_TO_AND_LISTEN_STORE_FILTER_MISMATCH,
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
                  isDefined(p.listen) &&
                  isDefined(reportField.store_result) &&
                  isDefined(storeField) &&
                  storeField.result !== reportField.store_result
                ) {
                  item.errors.push(
                    new BmError({
                      title:
                        ErTitleEnum.APPLY_TO_AND_LISTEN_STORE_RESULT_MISMATCH,
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

                let storeResult: FileStoreResult;

                if (storeField.fieldClass !== FieldClassEnum.Filter) {
                  storeResult = store.results.find(
                    sResult => sResult.result === storeField.result
                  );
                }

                if (isDefined(p.fractions)) {
                  if (
                    storeField.fieldClass === FieldClassEnum.Filter &&
                    isDefined(storeField.max_fractions) &&
                    p.fractions.length > Number(storeField.max_fractions)
                  ) {
                    item.errors.push(
                      new BmError({
                        title: ErTitleEnum.MAX_FRACTIONS_EXCEEDED,
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

                  checkStoreFraction(
                    {
                      storeFilter:
                        storeField.fieldClass === FieldClassEnum.Filter
                          ? storeField
                          : undefined,
                      storeResult:
                        storeField.fieldClass === FieldClassEnum.Filter
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
                      checkStoreFractionControls(
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
                        checkStoreFractionControlsUse(
                          {
                            controls: fraction.controls,
                            storeControls:
                              storeField.fieldClass === FieldClassEnum.Filter
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

              if (metric?.modelType === ModelTypeEnum.Malloy) {
                let apiModel = item.apiModels.find(
                  y => y.modelId === metric.modelId
                );

                let modelField = apiModel.fields.find(x => x.id === p.apply_to);

                if (isUndefined(modelField)) {
                  item.errors.push(
                    new BmError({
                      title: ErTitleEnum.APPLY_TO_REFS_MISSING_MODEL_FIELD,
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

                if (isDefined(p.listen) && isDefined(p.conditions)) {
                  item.errors.push(
                    new BmError({
                      title: ErTitleEnum.PARAMETER_WRONG_COMBINATION,
                      message: `found that both parameters "${ParameterEnum.Conditions}" and "${ParameterEnum.Listen}" are specified`,
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

                if (isDefined(p.conditions)) {
                  if (p.conditions.length === 0) {
                    item.errors.push(
                      new BmError({
                        title: ErTitleEnum.APPLY_TO_CONDITIONS_IS_EMPTY,
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
                    isGetTimeRange: false
                    // timezone: timezone,
                    // weekStart: weekStart,
                    // timeSpec: timeSpec
                    // caseSensitiveStringFilters: caseSensitiveStringFilters,
                    // fractions: fractions,
                  });

                  if (pf.valid === 0) {
                    item.errors.push(
                      new BmError({
                        title: ErTitleEnum.APPLY_TO_WRONG_CONDITIONS,
                        message:
                          `wrong expression "${pf.brick}" of apply_to "${p.apply_to}" ` +
                          `for ${ParameterEnum.Result} "${pResult}" `,
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

                if (isDefined(p.listen)) {
                  if (reportField.result !== pResult) {
                    item.errors.push(
                      new BmError({
                        title:
                          ErTitleEnum.ROW_PARAMETER_AND_LISTEN_RESULT_MISMATCH,
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newReports);

  return newReports;
}
