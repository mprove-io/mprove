import { ConfigService } from '@nestjs/config';
import { barSpecial } from '~blockml/barrels/bar-special';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckTileParameters;

export function checkTileParameters<T extends types.dzType>(
  item: {
    caseSensitiveStringFilters: boolean;
    entities: T[];
    models: common.FileModel[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId, models, caseSensitiveStringFilters } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.tiles.forEach(tile => {
      if (common.isUndefined(tile.parameters)) {
        tile.parameters = [];
      }

      tile.parameters.forEach(p => {
        let pKeysLineNums: number[] = Object.keys(p)
          .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
          .map(y => p[y as keyof common.FileTileParameter] as number);

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

        if (common.isUndefined(p.listen) && common.isUndefined(p.conditions)) {
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
        if (x.fileExt === common.FileExtensionEnum.Dashboard) {
          tile.listen = {};
        }
        tile.combinedFilters = {};

        let model = models.find(m => m.name === tile.model);

        tile.parameters
          .filter(p => common.isDefined(p.apply_to))
          .forEach(p => {
            let reg =
              common.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_AND_WHITESPACES_G();
            let r = reg.exec(p.apply_to);

            if (common.isUndefined(r)) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.APPLY_TO_WRONG_REFERENCE,
                  message: 'Tile apply_to must be in form "alias.field_name"',
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

            let listener = `${asName}.${fieldName}`;

            if (asName === constants.MF) {
              let modelField = model.fields.find(
                mField => mField.name === fieldName
              );

              if (common.isUndefined(modelField)) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.APPLY_TO_REFS_MISSING_MODEL_FIELD,
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
                    title: common.ErTitleEnum.APPLY_TO_REFS_MISSING_VIEW_FIELD,
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
            }

            if (common.isDefined(p.listen) && common.isDefined(p.conditions)) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.PARAMETER_WRONG_COMBINATION,
                  message: `found that both parameters "conditions" and "listen" are specified`,
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

            let pResult =
              asName === constants.MF
                ? model.fields.find(mField => mField.name === fieldName).result
                : model.joins
                    .find(j => j.as === asName)
                    .view.fields.find(vField => vField.name === fieldName)
                    .result;

            if (common.isDefined(p.conditions)) {
              if (p.conditions.length === 0) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.APPLY_TO_CONDITIONS_IS_EMPTY,
                    message: `apply_to conditions can not be empty`,
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

            if (
              common.isDefined(p.listen) &&
              x.fileExt === common.FileExtensionEnum.Chart
            ) {
              item.errors.push(
                new BmError({
                  title:
                    common.ErTitleEnum.CHART_TILE_PARAMETER_CAN_NOT_HAVE_LISTEN,
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
            } else if (common.isDefined(p.listen)) {
              let dashboardField = (<common.FileDashboard>x).fields.find(
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
              } else if (dashboardField.result !== pResult) {
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
