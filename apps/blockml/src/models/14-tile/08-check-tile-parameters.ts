import { ConfigService } from '@nestjs/config';
import { barSpecial } from '~blockml/barrels/bar-special';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';
import { bricksToFractions } from '~node-common/functions/bricks-to-fractions';
import { getTileApiModel } from '~node-common/functions/get-tile-api-model';

let func = common.FuncEnum.CheckTileParameters;

export function checkTileParameters<T extends types.dcType>(
  item: {
    caseSensitiveStringFilters: boolean;
    entities: T[];
    mods: common.FileMod[];
    apiModels: common.Model[];
    stores: common.FileStore[];
    malloyFiles: common.BmlFile[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
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
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

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

      if (common.isUndefined(tile.parameters)) {
        tile.parameters = [];
      }

      tile.parameters.forEach(p => {
        let pKeysLineNums: number[] = Object.keys(p)
          .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
          .map(y => p[y as keyof common.FileTileParameter] as number)
          .filter(ln => ln !== 0);

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

        if (
          apiModel.type !== common.ModelTypeEnum.Store &&
          common.isUndefined(p.listen) &&
          common.isUndefined(p.conditions)
        ) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.MISSING_LISTEN_OR_CONDITIONS,
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

        if (
          // isStore === true &&
          apiModel.type === common.ModelTypeEnum.Store &&
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
            let lines: common.FileErrorLine[] = n.lineNumbers.map(y => ({
              line: y,
              name: x.fileName,
              path: x.filePath
            }));

            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.DUPLICATE_APPLY_TO,
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

        if (x.fileExt === common.FileExtensionEnum.Dashboard) {
          tile.listen = {};
        }
        tile.combinedFilters = {};

        let store: common.FileStore;

        if (apiModel.type === common.ModelTypeEnum.Store) {
          store = stores.find(m => m.name === tile.model);
        }

        tile.parameters
          .filter(p => common.isDefined(p.apply_to))
          .forEach(p => {
            if (
              common.isDefined(p.listen) &&
              x.fileExt === common.FileExtensionEnum.Chart
            ) {
              item.errors.push(
                new BmError({
                  title:
                    common.ErTitleEnum.CHART_TILE_PARAMETER_CANNOT_HAVE_LISTEN,
                  message:
                    `${common.FileExtensionEnum.Chart} does not support ` +
                    `"${common.ParameterEnum.Listen}" parameter for tiles`,
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

            if (common.isDefined(p.listen)) {
              dashboardField = (<common.FileDashboard>x).fields.find(
                f => f.name === p.listen
              );

              if (common.isUndefined(dashboardField)) {
                item.errors.push(
                  new BmError({
                    title:
                      common.ErTitleEnum
                        .TILE_PARAMETER_LISTENS_TO_MISSING_DASHBOARD_FILTER,
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
              apiModel.type === common.ModelTypeEnum.Store
            ) {
              let storeField = store.fields.find(
                sField => sField.name === p.apply_to
              );

              if (common.isUndefined(storeField)) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.APPLY_TO_REFS_MISSING_STORE_FIELD,
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

              if (common.isDefined(p.listen) && common.isDefined(p.fractions)) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.PARAMETER_WRONG_COMBINATION_STORE,
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
                common.isDefined(dashboardField.store_filter) &&
                common.isDefined(storeField) &&
                (storeField.fieldClass !== common.FieldClassEnum.Filter ||
                  storeField.name !== dashboardField.store_filter)
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
                common.isDefined(dashboardField.store_result) &&
                common.isDefined(storeField) &&
                storeField.result !== dashboardField.store_result
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

              listener = p.apply_to;

              if (common.isDefined(p.listen)) {
                tile.listen[listener] = dashboardField.name;

                // console.log('dashboardField.fractions');
                // console.log(dashboardField.fractions);

                // console.log('dashboardField.apiFractions');
                // console.log(dashboardField.apiFractions);

                p.fractions = dashboardField.fractions;
              }
            }

            if (apiModel.type === common.ModelTypeEnum.Malloy) {
              let modelField = apiModel.fields.find(x => x.id === p.apply_to);

              if (common.isUndefined(modelField)) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.APPLY_TO_REFS_MISSING_MODEL_FIELD,
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

                // let pf = barSpecial.processFilter({
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

              listener = p.apply_to;

              if (common.isDefined(p.listen)) {
                if (dashboardField.result !== pResult) {
                  item.errors.push(
                    new BmError({
                      title:
                        common.ErTitleEnum
                          .TILE_PARAMETER_AND_LISTEN_RESULT_MISMATCH,
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
              } else if (
                common.isDefined(p.conditions) &&
                p.conditions.length > 0
              ) {
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
    newEntities
  );

  return newEntities;
}
