import { ConfigService } from '@nestjs/config';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';

import type { FileChart } from '#common/types/blockml/parts/internal/file-chart';
import type { FileDashboard } from '#common/types/blockml/parts/internal/file-dashboard';
import type { FileReport } from '#common/types/blockml/parts/internal/file-report';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import type { ModelMetric } from '#common/types/blockml/parts/model/model-metric';

let func: Func = 'extra/log-struct';

export async function logStruct(
  item: {
    stores: FileStore[];
    reports: FileReport[];
    dashboards: FileDashboard[];
    charts: FileChart[];
    metrics: ModelMetric[];
    structId: string;
    errors: BmError[];
    caller: Caller;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { reports, metrics, stores, dashboards, charts, structId, caller } = item;

  log(cs, caller, func, structId, 'out_errors.log', item.errors);
  log(cs, caller, func, structId, 'out_stores.log', stores);
  log(cs, caller, func, structId, 'out_reports.log', reports);
  log(cs, caller, func, structId, 'out_dashboards.log', dashboards);
  log(cs, caller, func, structId, 'out_charts.log', charts);
  log(cs, caller, func, structId, 'out_metrics.log', metrics);
}
