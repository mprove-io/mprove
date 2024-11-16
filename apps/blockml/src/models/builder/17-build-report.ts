import { ConfigService } from '@nestjs/config';
import { barReport } from '~blockml/barrels/bar-report';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildReport(
  item: {
    reps: common.FileReport[];
    metrics: common.MetricAny[];
    models: common.FileModel[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let reps = item.reps;

  reps = barReport.checkReport(
    {
      reps: reps,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reps = barReport.checkReportAccess(
    {
      reps: reps,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reps = barReport.checkReportRowUnknownParameters(
    {
      reps: reps,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reps = barReport.checkReportRowUnknownParams(
    {
      reps: reps,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reps = barReport.checkReportRow(
    {
      reps: reps,
      metrics: item.metrics,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reps = barReport.checkReportRowIds(
    {
      reps: reps,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reps = barReport.checkReportRowParameters(
    {
      reps: reps,
      metrics: item.metrics,
      models: item.models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return reps;
}
