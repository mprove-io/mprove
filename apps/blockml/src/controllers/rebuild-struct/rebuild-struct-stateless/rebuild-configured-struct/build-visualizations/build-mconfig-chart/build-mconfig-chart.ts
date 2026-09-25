import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { CallerEnum } from '#common/enums/special/caller.enum';
import type { drcType } from '#common/types/drc-type';
import type { FileStore } from '#common/zod/blockml/internal/file-store';
import type { Model } from '#common/zod/blockml/model';
import { checkChartData } from './check-chart-data/check-chart-data';
import { checkChartDataParameters } from './check-chart-data-parameters/check-chart-data-parameters';
import { checkChartOptionsParameters } from './check-chart-options-parameters/check-chart-options-parameters';
import { checkChartOptionsSeriesParameters } from './check-chart-options-series-parameters/check-chart-options-series-parameters';
import { checkChartOptionsXAxisParameters } from './check-chart-options-x-axis-parameters/check-chart-options-x-axis-parameters';
import { checkChartOptionsYAxisParameters } from './check-chart-options-y-axis-parameters/check-chart-options-y-axis-parameters';
import { checkChartPlateParameters } from './check-chart-plate-parameters/check-chart-plate-parameters';
import { checkChartType } from './check-chart-type/check-chart-type';

export function buildMconfigChart<T extends drcType>(item: {
  entities: T[];
  apiModels: Model[];
  stores: FileStore[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<T[], never> {
  return Result.pipe(
    Result.succeed({
      ...item,
      isTileCharts:
        item.caller === CallerEnum.BuildDashboardTileCharts ||
        item.caller === CallerEnum.BuildChartTileCharts
    }),
    Result.bind(
      'typeCheckedEntities',
      (v): Result.Result<T[], never> =>
        v.isTileCharts
          ? checkChartType({
              entities: v.entities,
              structId: v.structId,
              errors: v.errors,
              caller: v.caller,
              cs: v.cs
            })
          : Result.succeed(v.entities)
    ),
    Result.bind(
      'dataCheckedEntities',
      (v): Result.Result<T[], never> =>
        v.isTileCharts
          ? checkChartData({
              entities: v.typeCheckedEntities,
              structId: v.structId,
              errors: v.errors,
              caller: v.caller,
              cs: v.cs
            })
          : Result.succeed(v.typeCheckedEntities)
    ),
    Result.bind(
      'dataParametersCheckedEntities',
      (v): Result.Result<T[], never> =>
        v.isTileCharts
          ? checkChartDataParameters({
              entities: v.dataCheckedEntities,
              apiModels: v.apiModels,
              stores: v.stores,
              structId: v.structId,
              errors: v.errors,
              caller: v.caller,
              cs: v.cs
            })
          : Result.succeed(v.dataCheckedEntities)
    ),
    Result.bind(
      'plateParametersCheckedEntities',
      (v): Result.Result<T[], never> =>
        v.isTileCharts
          ? checkChartPlateParameters({
              entities: v.dataParametersCheckedEntities,
              structId: v.structId,
              errors: v.errors,
              caller: v.caller,
              cs: v.cs
            })
          : Result.succeed(v.dataParametersCheckedEntities)
    ),
    Result.bind(
      'optionsParametersCheckedEntities',
      (v): Result.Result<T[], never> =>
        checkChartOptionsParameters({
          entities: v.plateParametersCheckedEntities,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'xAxisParametersCheckedEntities',
      (v): Result.Result<T[], never> =>
        checkChartOptionsXAxisParameters({
          entities: v.optionsParametersCheckedEntities,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'yAxisParametersCheckedEntities',
      (v): Result.Result<T[], never> =>
        checkChartOptionsYAxisParameters({
          entities: v.xAxisParametersCheckedEntities,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.andThen(
      (v): Result.Result<T[], never> =>
        checkChartOptionsSeriesParameters({
          entities: v.yAxisParametersCheckedEntities,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    )
  );
}
