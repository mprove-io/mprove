import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../../models/bm-error';
import { interfaces } from '../../barrels/interfaces';
import { barReport } from '../../barrels/bar-report';

export function buildReport(item: {
  dashboards: interfaces.Dashboard[];
  models: interfaces.Model[];
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

  dashboards = barReport.processListenFilters({
    dashboards: dashboards,
    models: item.models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  // dashboards = barReport.processDefaultFilters({
  //   dashboards: dashboards,
  //   models: models
  // });

  // dashboards = barReport.checkReportDefaultFilters({
  //   dashboards: dashboards,
  //   models: models,
  //   weekStart: item.weekStart,
  //   connection: item.connection
  // });

  // dashboards = barReport.combineReportFilters({ dashboards: dashboards });

  // dashboards = barReport.checkFiltersForceDims({
  //   dashboards: dashboards,
  //   models: models
  // });

  // dashboards = barReport.checkWhereCalcForceDims({
  //   dashboards: dashboards,
  //   models: models
  // });

  // dashboards = await barReport.fetchBqViews({
  //   dashboards: dashboards,
  //   models: models,
  //   udfs: udfs,
  //   weekStart: item.weekStart,
  //   connection: item.connection,
  //   bqProject: item.bqProject,
  //   projectId: item.projectId,
  //   structId: item.structId
  // });

  return dashboards;
}
