import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileExtension } from '#common/types/blockml/parts/file/file-extension';
import type { FileParameter } from '#common/types/blockml/parts/file/file-parameter';
import type { FileChart } from '#common/types/blockml/parts/internal/file-chart';

let func: Func = 'build-chart/check-chart-tiles-exist';

export function checkChartTilesExist(item: {
  charts: FileChart[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileChart[], never> {
  let { cs, ...input } = item;

  let { caller, structId } = input;

  log(cs, caller, func, structId, 'input.log', input);

  let newCharts: FileChart[] = [];

  item.charts.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (isUndefined(x.tiles)) {
      item.errors.push(
        new BmError({
          title: 'CHART_MISSING_TILES',
          message:
            `${'.chart' satisfies FileExtension} must have ` +
            `"${'tiles' satisfies FileParameter}" parameter`,
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
          title: 'CHART_TOO_MANY_TILES',
          message: `${'.chart' satisfies FileExtension} must have exactly one tile`,
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

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_charts.log', newCharts);

  return Result.succeed(newCharts);
}
