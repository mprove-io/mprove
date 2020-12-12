import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../../models/bm-error';
import { interfaces } from '../../barrels/interfaces';
import { barReport } from '../../barrels/bar-report';

export async function buildReport(item: {
  dashboards: interfaces.Dashboard[];
  models: interfaces.Model[];
  udfsDict: api.UdfsDict;
  projectId: string;
  weekStart: api.ProjectWeekStartEnum;
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let dashboards = item.dashboards;

  dashboards = barReport.checkReportIsObject({
    dashboards: dashboards,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  dashboards = barReport.checkReportUnknownParameters({
    dashboards: dashboards,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  dashboards = barReport.checkReportTitleModelSelect({
    dashboards: dashboards,
    models: item.models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  dashboards = barReport.checkSelectElements({
    dashboards: dashboards,
    models: item.models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  dashboards = barReport.checkSelectForceDims({
    dashboards: dashboards,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  dashboards = barReport.checkSorts({
    dashboards: dashboards,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  dashboards = barReport.checkTimezone({
    dashboards: dashboards,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  dashboards = barReport.checkLimit({
    dashboards: dashboards,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  dashboards = barReport.checkListenFilters({
    dashboards: dashboards,
    models: item.models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  dashboards = barReport.checkDefaultFilters({
    dashboards: dashboards,
    models: item.models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  dashboards = barReport.combineReportFilters({
    dashboards: dashboards,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  dashboards = barReport.checkFiltersForceDims({
    dashboards: dashboards,
    models: item.models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  dashboards = barReport.checkSqlAlwaysWhereCalcForceDims({
    dashboards: dashboards,
    models: item.models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  dashboards = await barReport.fetchSql({
    dashboards: dashboards,
    models: item.models,
    udfsDict: item.udfsDict,
    weekStart: item.weekStart,
    projectId: item.projectId,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  return dashboards;
}
