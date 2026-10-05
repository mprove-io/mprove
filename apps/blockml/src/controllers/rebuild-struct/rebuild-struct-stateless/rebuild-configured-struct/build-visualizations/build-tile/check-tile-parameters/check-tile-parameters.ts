import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { checkStoreFraction } from '#blockml/functions/check-store-fraction/check-store-fraction';
import { checkStoreFractionControls } from '#blockml/functions/check-store-fraction-controls/check-store-fraction-controls';
import { checkStoreFractionControlsUse } from '#blockml/functions/check-store-fraction-controls-use/check-store-fraction-controls-use';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileExtension } from '#common/types/blockml/parts/file/file-extension';
import type { FileParameter } from '#common/types/blockml/parts/file/file-parameter';
import type { dcType } from '#common/types/blockml/parts/internal/dc-type';
import type { FileDashboard } from '#common/types/blockml/parts/internal/file-dashboard';
import type { FileErrorLine } from '#common/types/blockml/parts/internal/file-error-line';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import type { FileStoreResult } from '#common/types/blockml/parts/internal/file-store-result';
import type { FileTileParameter } from '#common/types/blockml/parts/internal/file-tile-parameter';
import type { Model } from '#common/types/blockml/parts/model/model';
import { bricksToFractions } from '#node-common/functions/bricks-to-fractions/bricks-to-fractions';

let func: Func = 'build-tile/check-tile-parameters';

export function checkTileParameters<T extends dcType>(item: {
  caseSensitiveStringFilters: boolean;
  entities: T[];
  apiModels: Model[];
  stores: FileStore[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<T[], never> {
  let { cs, ...input } = item;

  let { caller, structId, apiModels, stores, caseSensitiveStringFilters } =
    item;

  log(cs, caller, func, structId, 'input.log', input);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.tiles.forEach(tile => {
      let apiModel = apiModels.find(y => y.modelId === tile.model);

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
              title: 'MISSING_APPLY_TO',
              message: `parameter "${'apply_to' satisfies FileParameter}" is required`,
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
          apiModel.type !== 'Store' &&
          isUndefined(p.listen) &&
          isUndefined(p.conditions)
        ) {
          item.errors.push(
            new BmError({
              title: 'MISSING_LISTEN_OR_CONDITIONS',
              message:
                `"${'listen' satisfies FileParameter}" or ` +
                `"${'conditions' satisfies FileParameter}" must be specified for a tile parameter`,
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
          apiModel.type === 'Store' &&
          isUndefined(p.listen) &&
          isUndefined(p.fractions)
        ) {
          item.errors.push(
            new BmError({
              title: 'MISSING_LISTEN_OR_FRACTIONS',
              message:
                `"${'listen' satisfies FileParameter}" or ` +
                `"${'conditions' satisfies FileParameter}" must be specified for a tile parameter`,
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
                title: 'DUPLICATE_APPLY_TO',
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
        let apiModel = apiModels.find(y => y.modelId === tile.model);

        if (x.fileExt === '.dashboard') {
          tile.listen = {};
        }
        tile.combinedFilters = {};

        let store: FileStore;

        if (apiModel.type === 'Store') {
          store = stores.find(m => m.name === tile.model);
        }

        tile.parameters
          .filter(p => isDefined(p.apply_to))
          .forEach(p => {
            if (isDefined(p.listen) && x.fileExt === '.chart') {
              item.errors.push(
                new BmError({
                  title: 'CHART_TILE_PARAMETER_CANNOT_HAVE_LISTEN',
                  message:
                    `${'.chart' satisfies FileExtension} does not support ` +
                    `"${'listen' satisfies FileParameter}" parameter for tiles`,
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
                    title: 'TILE_PARAMETER_LISTENS_TO_MISSING_DASHBOARD_FILTER',
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

            if (apiModel.type === 'Store') {
              let storeField = store.fields.find(
                sField => sField.name === p.apply_to
              );

              if (isUndefined(storeField)) {
                item.errors.push(
                  new BmError({
                    title: 'APPLY_TO_REFS_MISSING_STORE_FIELD',
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
                    title: 'PARAMETER_WRONG_COMBINATION_STORE',
                    message: `found that both parameters "${'fractions' satisfies FileParameter}" and "${'listen' satisfies FileParameter}" are specified`,
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
                    title: 'FRACTIONS_LIST_IS_EMPTY',
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
                (storeField.fieldClass !== 'filter' ||
                  storeField.name !== dashboardField.store_filter)
              ) {
                item.errors.push(
                  new BmError({
                    title: 'APPLY_TO_AND_LISTEN_STORE_FILTER_MISMATCH',
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
                    title: 'APPLY_TO_AND_LISTEN_STORE_RESULT_MISMATCH',
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

              if (storeField.fieldClass !== 'filter') {
                storeResult = store.results.find(
                  sResult => sResult.result === storeField.result
                );
              }

              if (isDefined(p.fractions)) {
                if (
                  storeField.fieldClass === 'filter' &&
                  isDefined(storeField.max_fractions) &&
                  p.fractions.length > Number(storeField.max_fractions)
                ) {
                  item.errors.push(
                    new BmError({
                      title: 'MAX_FRACTIONS_EXCEEDED',
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
                      storeField.fieldClass === 'filter'
                        ? storeField
                        : undefined,
                    storeResult:
                      storeField.fieldClass === 'filter'
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
                            storeField.fieldClass === 'filter'
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

                p.fractions = dashboardField.fractions;
              }
            }

            if (apiModel.type === 'Malloy') {
              let modelField = apiModel.fields.find(x => x.id === p.apply_to);

              if (isUndefined(modelField)) {
                item.errors.push(
                  new BmError({
                    title: 'APPLY_TO_REFS_MISSING_MODEL_FIELD',
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

              if (modelField.isTimeframeBase === true) {
                item.errors.push(
                  new BmError({
                    title: 'FIELD_GROUP_T_FIELD_CANNOT_BE_FILTERED',
                    message: `field "${p.apply_to}" cannot be filtered. Use _ts field instead`,
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
                    title: 'PARAMETER_WRONG_COMBINATION',
                    message: `found that both parameters "${'conditions' satisfies FileParameter}" and "${'listen' satisfies FileParameter}" are specified`,
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
                      title: 'APPLY_TO_CONDITIONS_IS_EMPTY',
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
                });

                if (pf.valid === 0) {
                  item.errors.push(
                    new BmError({
                      title: 'APPLY_TO_WRONG_CONDITIONS',
                      message:
                        `wrong expression "${pf.brick}" of apply_to "${p.apply_to}" ` +
                        `for ${'result' satisfies FileParameter} "${pResult}" `,
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
                      title: 'TILE_PARAMETER_AND_LISTEN_RESULT_MISMATCH',
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

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_entities.log', newEntities);

  return Result.succeed(newEntities);
}
