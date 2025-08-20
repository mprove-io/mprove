import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { ParameterEnum } from '~common/enums/docs/parameter.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { ErTitleEnum } from '~common/enums/special/er-title.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { FileErrorLine } from '~common/interfaces/blockml/internal/file-error-line';
import { FilePartTile } from '~common/interfaces/blockml/internal/file-part-tile';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';
import { Model } from '~common/interfaces/blockml/model';
import { MyRegex } from '~common/models/my-regex';
import { dcType } from '~common/types/dc-type';
import { log } from '../extra/log';

let func = FuncEnum.CheckTileTitleModelSelect;

export function checkTileTitleModelSelect<T extends dcType>(
  item: {
    entities: T[];
    stores: FileStore[];
    apiModels: Model[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId, apiModels } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    let titles: { [title: string]: number[] } = {};

    x.tiles.forEach(tile => {
      if (isUndefined(tile.title)) {
        let lineNums: number[] = [];

        Object.keys(tile)
          .filter(p => p.match(MyRegex.ENDS_WITH_LINE_NUM()))
          .forEach(l => lineNums.push(tile[l as keyof FilePartTile] as number));

        item.errors.push(
          new BmError({
            title: ErTitleEnum.MISSING_TILE_TITLE,
            message: `tile must have ${ParameterEnum.Title} parameter`,
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
      } else if (isDefined(titles[tile.title.toUpperCase()])) {
        titles[tile.title.toUpperCase()].push(tile.title_line_num);
      } else {
        titles[tile.title.toUpperCase()] = [tile.title_line_num];
      }

      if (
        isUndefined(tile.model)
        // && isUndefined(tile.query)
      ) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.MISSING_TILE_MODEL,
            message: `tile must have "${ParameterEnum.Model}" parameter`,
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

      // if (isDefined(tile.model) && isDefined(tile.query)) {
      //   item.errors.push(
      //     new BmError({
      //       title:
      //         ErTitleEnum
      //           .TILE_QUERY_AND_MODEL_CANNOT_BE_SPECIFIED_AT_THE_SAME_TIME,
      //       message: `tile must have only one of parameters:${ParameterEnum.Query}, ${ParameterEnum.Model}`,
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

      let apiModel = item.apiModels.find(y => y.modelId === tile.model);

      if (isUndefined(apiModel)) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.WRONG_TILE_MODEL,
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

      let store;

      if (apiModel.type === ModelTypeEnum.Store) {
        store = item.stores.find(m => m.name === tile.model);
      }

      if (
        isUndefined(tile.select)
        //  && isUndefined(tile.query)
      ) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.MISSING_TILE_SELECT,
            message: `tile must have "${ParameterEnum.Select}" parameter`,
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
        let lines: FileErrorLine[] = titles[title].map(lineNum => ({
          line: lineNum,
          name: x.fileName,
          path: x.filePath
        }));

        item.errors.push(
          new BmError({
            title: ErTitleEnum.DUPLICATE_TILE_TITLE,
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newEntities);

  return newEntities;
}
