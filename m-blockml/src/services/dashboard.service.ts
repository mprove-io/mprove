import { api } from '../barrels/api';
import { enums } from '../barrels/enums';
import { interfaces } from '../barrels/interfaces';
import { barSpecial } from '../barrels/bar-special';
import { barWrapper } from '../barrels/bar-wrapper';

import { Injectable } from '@nestjs/common';
import { forEachSeries } from 'p-iteration';

@Injectable()
export class DashboardService {
  async processDashboard(item: {
    projectId: string;
    structId: string;
    repoId: string;
    weekStart: api.ProjectWeekStartEnum;
    udfsDict: api.UdfsDict;
    modelsContent: string[];
    dashboardContent: string;
    newDashboardId: string;
    newDashboardFields: api.DashboardField[];
  }) {
    let {
      projectId,
      structId,
      repoId,
      weekStart,
      udfsDict,
      modelsContent,
      dashboardContent,
      newDashboardId,
      newDashboardFields
    } = item;

    let models: interfaces.Model[] = modelsContent.map(mc => JSON.parse(mc));
    let dashboard: interfaces.Dashboard = JSON.parse(dashboardContent);

    let dashboardFilters: interfaces.FilterBricksDictionary = {};

    newDashboardFields.forEach(f => {
      let fieldId = f.id;
      let bricks = f.fractions.map(fraction => fraction.brick);
      dashboardFilters[fieldId] = bricks;
    });

    dashboard.filters = dashboardFilters;

    await forEachSeries(dashboard.reports, async report => {
      let filters: interfaces.FilterBricksDictionary = {};

      Object.keys(report.default).forEach(defaultFilter => {
        if (report.default[defaultFilter].length > 0) {
          filters[defaultFilter] = report.default[defaultFilter];
        }
      });

      // default override by listen
      Object.keys(report.listen).forEach(filter => {
        let listen = report.listen[filter];

        if (dashboardFilters[listen].length > 0) {
          filters[filter] = dashboardFilters[listen];
        }
      });

      report.combinedFilters = filters;

      let model = models.find(m => m.name === report.model);

      let { sql, filtersFractions } = await barSpecial.genSql({
        model: model,
        select: report.select,
        sorts: report.sorts,
        timezone: report.timezone,
        limit: report.limit,
        filters: filters,
        weekStart: weekStart,
        projectId: projectId,
        udfsDict: udfsDict,
        structId: structId,
        errors: [],
        caller: enums.CallerEnum.ProcessDashboard
      });

      report.sql = sql;
      report.filtersFractions = filtersFractions;
    });

    let {
      apiDashboards,
      dashMconfigs,
      dashQueries
    } = barWrapper.wrapDashboards({
      projectId: projectId,
      repoId: repoId,
      dashboards: [dashboard],
      structId: structId
    });

    let newDashboard = apiDashboards[0];

    newDashboard.fields = newDashboardFields;
    newDashboard.dashboardId = newDashboardId;
    newDashboard.temp = true;

    dashMconfigs.forEach(mconfig => {
      mconfig.temp = true;
    });

    dashQueries.forEach(query => {
      query.temp = true;
    });

    let payload: api.ToBlockmlProcessDashboardResponsePayload = {
      dashboard: newDashboard,
      mconfigs: dashMconfigs,
      queries: dashQueries
    };

    return payload;
  }
}
