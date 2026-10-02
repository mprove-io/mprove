import { ConfigService } from '@nestjs/config';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import type { FileChart } from '#common/types/blockml/parts/internal/file-chart';
import type { FileDashboard } from '#common/types/blockml/parts/internal/file-dashboard';
import type { FileReport } from '#common/types/blockml/parts/internal/file-report';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import type { ModelMetric } from '#common/types/blockml/parts/model-metric';

let func = FuncEnum.LogStruct;

export async function logStruct(
  item: {
    stores: FileStore[];
    reports: FileReport[];
    dashboards: FileDashboard[];
    charts: FileChart[];
    metrics: ModelMetric[];
    structId: string;
    errors: BmError[];
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { reports, metrics, stores, dashboards, charts, structId, caller } = item;

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Stores, stores);
  log(cs, caller, func, structId, LogTypeEnum.Reports, reports);
  log(cs, caller, func, structId, LogTypeEnum.Ds, dashboards);
  log(cs, caller, func, structId, LogTypeEnum.Charts, charts);
  log(cs, caller, func, structId, LogTypeEnum.Metrics, metrics);
}
