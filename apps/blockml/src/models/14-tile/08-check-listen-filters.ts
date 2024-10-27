import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckListenFilters;

export function checkListenFilters<T extends types.dzType>(
  item: {
    entities: T[];
    models: common.FileModel[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.tiles.forEach(tile => {
      tile.listen = {};

      if (common.isUndefined(tile.listen_filters)) {
        tile.listen_filters = {};
        return;
      }

      if (
        common.isDefined(tile.listen_filters) &&
        x.fileExt === common.FileExtensionEnum.Vis
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.VIS_TILE_CAN_NOT_HAVE_LISTEN_FILTERS,
            message:
              `${common.FileExtensionEnum.Vis} does not support ` +
              `"${common.ParameterEnum.ListenFilters}" parameter for tiles`,
            lines: [
              {
                line: tile[
                  (common.ParameterEnum.ListenFilters +
                    constants.LINE_NUM) as keyof common.FilePartTile
                ] as number,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      let model = item.models.find(m => m.name === tile.model);

      Object.keys(tile.listen_filters)
        .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(filterName => {
          let dashboardField = (<common.FileDashboard>x).fields.find(
            f => f.name === filterName
          );

          if (common.isUndefined(dashboardField)) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.TILE_LISTENS_MISSING_DASHBOARD_FILTER,
                message:
                  `tile listens ${common.FileExtensionEnum.Dashboard} filter "${filterName}" ` +
                  'that is missing or not valid',
                lines: [
                  {
                    line: (<any>tile.listen_filters)[
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

          tile.listen_filters[filterName].split(',').forEach(part => {
            let reg =
              common.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_AND_WHITESPACES_G();
            let r = reg.exec(part);

            if (common.isUndefined(r)) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.TILE_WRONG_LISTENER,
                  message:
                    `Listener "${part}" is not valid.` +
                    'Listeners must be in form "alias.field_name" ' +
                    '(one or more separated by comma)',
                  lines: [
                    {
                      line: (<any>tile.listen_filters)[
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

              if (common.isUndefined(modelField)) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.TILE_WRONG_LISTENER_MODEL_FIELD,
                    message:
                      `found listener "${listener}" references missing or not valid ` +
                      `field "${fieldName}" of model "${model.name}" fields section`,
                    lines: [
                      {
                        line: (<any>tile.listen_filters)[
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

              if (common.isDefined(tile.listen[listener])) {
                item.errors.push(
                  new BmError({
                    title:
                      common.ErTitleEnum
                        .TILE_MODEL_FIELD_LISTENS_MORE_THAN_ONE_FILTER,
                    message: `listener "${listener}" can not listen more than one filter`,
                    lines: [
                      {
                        line: tile.listen_filters_line_num,
                        name: x.fileName,
                        path: x.filePath
                      }
                    ]
                  })
                );
                return;
              }

              if (dashboardField.result !== modelField.result) {
                item.errors.push(
                  new BmError({
                    title:
                      common.ErTitleEnum
                        .TILE_FILTER_AND_MODEL_FIELD_RESULTS_MISMATCH,
                    message:
                      `"${filterName}" filter result "${dashboardField.result}" does not match ` +
                      `listener "${listener}" result "${modelField.result}"`,
                    lines: [
                      {
                        line: (<any>tile.listen_filters)[
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

              if (common.isUndefined(join)) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.TILE_WRONG_LISTENER_ALIAS,
                    message:
                      `found listener "${listener}" references missing alias ` +
                      `"${asName}" in joins section of model "${model.name}"`,
                    lines: [
                      {
                        line: (<any>tile.listen_filters)[
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

              if (common.isUndefined(viewField)) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.TILE_WRONG_LISTENER_VIEW_FIELD,
                    message:
                      `found listener "${listener}" references missing or not valid ` +
                      `field "${fieldName}" of view "${join.view.name}" fields section. ` +
                      `View has "${asName}" alias in "${model.name}" model.`,
                    lines: [
                      {
                        line: (<any>tile.listen_filters)[
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

              if (common.isDefined(tile.listen[listener])) {
                item.errors.push(
                  new BmError({
                    title:
                      common.ErTitleEnum
                        .TILE_VIEW_FIELD_LISTENS_MORE_THAN_ONE_FILTER,
                    message: `listener "${listener}" can not listen more than one filter`,
                    lines: [
                      {
                        line: tile.listen_filters_line_num,
                        name: x.fileName,
                        path: x.filePath
                      }
                    ]
                  })
                );
                return;
              }

              if (dashboardField.result !== viewField.result) {
                item.errors.push(
                  new BmError({
                    title:
                      common.ErTitleEnum
                        .TILE_FILTER_AND_VIEW_FIELD_RESULTS_MISMATCH,
                    message:
                      `"${filterName}" filter result "${dashboardField.result}" does not match ` +
                      `listener "${listener}" result "${viewField.result}"`,
                    lines: [
                      {
                        line: (<any>tile.listen_filters)[
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

            tile.listen[listener] = filterName;
          });
        });
    });

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
