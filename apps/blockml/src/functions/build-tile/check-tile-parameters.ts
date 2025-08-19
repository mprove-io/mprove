import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';
import { bricksToFractions } from '~node-common/functions/bricks-to-fractions';
import { getTileApiModel } from '~node-common/functions/get-tile-api-model';

let func = FuncEnum.CheckTileParameters;

export function checkTileParameters<T extends dcType>(
  item: {
    caseSensitiveStringFilters: boolean;
    entities: T[];
    mods: FileMod[];
    apiModels: Model[];
    stores: FileStore[];
    malloyFiles: BmlFile[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let {
    caller,
    structId,
    mods,
    apiModels,
    malloyFiles,
    stores,
    caseSensitiveStringFilters
  } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.tiles.forEach(tile => {
      let apiModel = getTileApiModel({
        mods: mods,
        filePath: x.filePath,
        apiModels: apiModels,
        tile: tile,
        malloyFiles: malloyFiles
      });

      if (isUndefined(tile.parameters)) {
        tile.parameters = [];
      }

      tile.parameters.forEach(p => {
        let pKeysLineNums: number[] = Object.keys(p)
          .filter(y => y.match(MyRegex.ENDS_WITH_LINE_NUM()))
          .map(y => p[y as keyof FileTileParameter] as number)
          .filter(ln => ln !== 0);

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

        if (
          apiModel.type !== ModelTypeEnum.Store &&
          isUndefined(p.listen) &&
          isUndefined(p.conditions)
        ) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.MISSING_LISTEN_OR_CONDITIONS,
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

        if (
          // isStore === true &&
          apiModel.type === ModelTypeEnum.Store &&
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
    });

    if (errorsOnStart === item.errors.length) {
      x.tiles.forEach(tile => {
        let pApplyToMaps: Array<{ applyTo: string; lineNumbers: number[] }> =
          [];

        tile.parameters.forEach(p => {
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
                message: 'Tile parameter apply_to must be unique',
                lines: lines
              })
            );
            return;
          }
        });
      });
    }

    if (errorsOnStart === item.errors.length) {
      x.tiles.forEach(tile => {
        let apiModel = getTileApiModel({
          mods: mods,
          filePath: x.filePath,
          apiModels: apiModels,
          tile: tile,
          malloyFiles: malloyFiles
        });

        if (x.fileExt === FileExtensionEnum.Dashboard) {
          tile.listen = {};
        }
        tile.combinedFilters = {};

        let store: FileStore;

        if (apiModel.type === ModelTypeEnum.Store) {
          store = stores.find(m => m.name === tile.model);
        }

        tile.parameters
          .filter(p => isDefined(p.apply_to))
          .forEach(p => {
            if (isDefined(p.listen) && x.fileExt === FileExtensionEnum.Chart) {
              item.errors.push(
                new BmError({
                  title: ErTitleEnum.CHART_TILE_PARAMETER_CANNOT_HAVE_LISTEN,
                  message:
                    `${FileExtensionEnum.Chart} does not support ` +
                    `"${ParameterEnum.Listen}" parameter for tiles`,
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

            let dashboardField;

            if (isDefined(p.listen)) {
              dashboardField = (<FileDashboard>x).fields.find(
                f => f.name === p.listen
              );

              if (isUndefined(dashboardField)) {
                item.errors.push(
                  new BmError({
                    title:
                      ErTitleEnum.TILE_PARAMETER_LISTENS_TO_MISSING_DASHBOARD_FILTER,
                    message:
                      `tile parameter listens dashboard filter "${p.listen}" ` +
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

            let listener;

            if (
              // isStore === true
              apiModel.type === ModelTypeEnum.Store
            ) {
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
                isDefined(dashboardField.store_filter) &&
                isDefined(storeField) &&
                (storeField.fieldClass !== FieldClassEnum.Filter ||
                  storeField.name !== dashboardField.store_filter)
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
                isDefined(dashboardField.store_result) &&
                isDefined(storeField) &&
                storeField.result !== dashboardField.store_result
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

              listener = p.apply_to;

              if (isDefined(p.listen)) {
                tile.listen[listener] = dashboardField.name;

                // console.log('dashboardField.fractions');
                // console.log(dashboardField.fractions);

                // console.log('dashboardField.apiFractions');
                // console.log(dashboardField.apiFractions);

                p.fractions = dashboardField.fractions;
              }
            }

            if (apiModel.type === ModelTypeEnum.Malloy) {
              let modelField = apiModel.fields.find(x => x.id === p.apply_to);

              if (isUndefined(modelField)) {
                item.errors.push(
                  new BmError({
                    title: ErTitleEnum.APPLY_TO_REFS_MISSING_MODEL_FIELD,
                    message:
                      `"${p.apply_to}" references missing or not valid field ` +
                      `of model "${apiModel.modelId}" fields section`,
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

                // let pf = processFilter({
                //   caseSensitiveStringFilters: caseSensitiveStringFilters,
                //   filterBricks: p.conditions,
                //   result: pResult
                // });

                let pf = bricksToFractions({
                  // caseSensitiveStringFilters: caseSensitiveStringFilters,
                  filterBricks: p.conditions,
                  result: pResult,
                  isGetTimeRange: false
                  // timezone: timezone,
                  // weekStart: weekStart,
                  // timeSpec: timeSpec
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

              listener = p.apply_to;

              if (isDefined(p.listen)) {
                if (dashboardField.result !== pResult) {
                  item.errors.push(
                    new BmError({
                      title:
                        ErTitleEnum.TILE_PARAMETER_AND_LISTEN_RESULT_MISMATCH,
                      message:
                        `"${p.listen}" result "${dashboardField.result}" does not match ` +
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

                tile.listen[listener] = dashboardField.name;
                tile.combinedFilters[listener] = dashboardField.conditions;
              } else if (isDefined(p.conditions) && p.conditions.length > 0) {
                tile.combinedFilters[listener] = p.conditions;
              }
            }
          });
      });
    }

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newEntities);

  return newEntities;
}
