import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { FileExtensionEnum } from '#common/enums/file-extension.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isUndefined } from '#common/functions/is-undefined';
import { FileChart } from '#common/interfaces/blockml/internal/file-chart';
import { log } from '../extra/log';

let func = FuncEnum.CheckChartTilesExist;

export function checkChartTilesExist(
  item: {
    charts: FileChart[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newCharts: FileChart[] = [];

  item.charts.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (isUndefined(x.tiles)) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.CHART_MISSING_TILES,
          message:
            `${FileExtensionEnum.Chart} must have ` +
            `"${ParameterEnum.Tiles}" parameter`,
          lines: [
            {
              line: x.chart_line_num,
              name: x.fileName,
              path: x.filePath
            }
          ]
        })
      );
      return;
    }

    if (x.tiles.length > 1) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.CHART_TOO_MANY_TILES,
          message: `${FileExtensionEnum.Chart} must have exactly one tile`,
          lines: [
            {
              line: x.chart_line_num,
              name: x.fileName,
              path: x.filePath
            }
          ]
        })
      );
      return;
    }

    if (errorsOnStart === item.errors.length) {
      newCharts.push(x);
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Charts, newCharts);

  return newCharts;
}
