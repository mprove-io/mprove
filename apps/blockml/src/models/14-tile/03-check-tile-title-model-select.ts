import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';
import { STORE_MODEL_PREFIX } from '~common/constants/top';

let func = common.FuncEnum.CheckTileTitleModelSelect;

export function checkTileTitleModelSelect<T extends types.dzType>(
  item: {
    entities: T[];
    models: common.FileModel[];
    stores: common.FileStore[];
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

    let titles: { [title: string]: number[] } = {};

    x.tiles.forEach(tile => {
      if (common.isUndefined(tile.title)) {
        let lineNums: number[] = [];

        Object.keys(tile)
          .filter(p => p.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
          .forEach(l =>
            lineNums.push(tile[l as keyof common.FilePartTile] as number)
          );

        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.MISSING_TILE_TITLE,
            message: `tile must have ${common.ParameterEnum.Title} parameter`,
            lines: [
              {
                line: Math.min(...lineNums),
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      } else if (common.isDefined(titles[tile.title.toUpperCase()])) {
        titles[tile.title.toUpperCase()].push(tile.title_line_num);
      } else {
        titles[tile.title.toUpperCase()] = [tile.title_line_num];
      }

      if (
        common.isUndefined(tile.model)
        // && common.isUndefined(tile.query)
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.MISSING_TILE_MODEL,
            message: `tile must have "${common.ParameterEnum.Model}" parameter`,
            lines: [
              {
                line: tile.title_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      // if (common.isDefined(tile.model) && common.isDefined(tile.query)) {
      //   item.errors.push(
      //     new BmError({
      //       title:
      //         common.ErTitleEnum
      //           .TILE_QUERY_AND_MODEL_CANNOT_BE_SPECIFIED_AT_THE_SAME_TIME,
      //       message: `tile must have only one of parameters:${common.ParameterEnum.Query}, ${common.ParameterEnum.Model}`,
      //       lines: [
      //         {
      //           line: tile.query_line_num,
      //           name: x.fileName,
      //           path: x.filePath
      //         },
      //         {
      //           line: tile.model_line_num,
      //           name: x.fileName,
      //           path: x.filePath
      //         }
      //       ]
      //     })
      //   );
      //   return;
      // }

      let isStore =
        common.isDefined(tile.model) &&
        tile.model.startsWith(STORE_MODEL_PREFIX);

      let model;
      let store;

      if (isStore === true) {
        store = item.stores.find(
          m => `${STORE_MODEL_PREFIX}_${m.name}` === tile.model
        );
      } else {
        model = item.models.find(m => m.name === tile.model);
      }

      if (
        isStore === false &&
        common.isDefined(tile.model) &&
        common.isUndefined(model)
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.WRONG_TILE_MODEL,
            message: `model "${tile.model}" is missing or not valid`,
            lines: [
              {
                line: tile.model_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (isStore === true && common.isUndefined(store)) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.WRONG_TILE_MODEL,
            message: `store "${
              tile.model.split(STORE_MODEL_PREFIX + '_')[1]
            }" is missing or not valid`,
            lines: [
              {
                line: tile.model_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (
        common.isUndefined(tile.select)
        //  && common.isUndefined(tile.query)
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.MISSING_TILE_SELECT,
            message: `tile must have "${common.ParameterEnum.Select}" parameter`,
            lines: [
              {
                line: tile.title_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }
    });

    Object.keys(titles).forEach(title => {
      if (titles[title].length > 1) {
        let lines: common.FileErrorLine[] = titles[title].map(lineNum => ({
          line: lineNum,
          name: x.fileName,
          path: x.filePath
        }));

        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.DUPLICATE_TILE_TITLE,
            message:
              'Tile titles must be unique for dashboard. ' +
              `Found duplicate "${title.toLocaleLowerCase()}" title`,
            lines: lines
          })
        );
      }
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
