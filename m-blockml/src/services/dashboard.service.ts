import { api } from '../barrels/api';
import { enums } from '../barrels/enums';
import { interfaces } from '../barrels/interfaces';
import { constants } from '../barrels/constants';
import { barSpecial } from '../barrels/bar-special';
import { barWrapper } from '../barrels/bar-wrapper';
import { RabbitService } from './rabbit.service';

import { Injectable } from '@nestjs/common';
import asyncPool from 'tiny-async-pool';

@Injectable()
export class DashboardService {
  constructor(private readonly rabbitService: RabbitService) {}

  async processDashboard(item: {
    traceId: string;
    structId: string;
    organizationId: string;
    projectId: string;
    weekStart: api.ProjectWeekStartEnum;
    udfsDict: api.UdfsDict;
    models: interfaces.Model[];
    dashboard: interfaces.Dashboard;
    newDashboardId: string;
    newDashboardFields: api.DashboardField[];
  }) {
    let {
      traceId,
      structId,
      organizationId,
      projectId,
      weekStart,
      udfsDict,
      models,
      dashboard,
      newDashboardId,
      newDashboardFields
    } = item;

    let dashboardFilters: interfaces.FilterBricksDictionary = {};

    newDashboardFields.forEach(f => {
      let fieldId = f.id;
      let bricks = f.fractions.map(fraction => fraction.brick);
      dashboardFilters[fieldId] = bricks;
    });

    dashboard.filters = dashboardFilters;

    await asyncPool(
      constants.CONCURRENCY_LIMIT,
      dashboard.reports,
      async report => {
        let filters: interfaces.FilterBricksDictionary = {};

        Object.keys(report.default_filters)
          .filter(k => !k.match(api.MyRegex.ENDS_WITH_LINE_NUM()))
          .forEach(defaultFilter => {
            if (report.default_filters[defaultFilter].length > 0) {
              filters[defaultFilter] = report.default_filters[defaultFilter];
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

        let { sql, filtersFractions, varsSqlSteps } = await barSpecial.genSql(
          this.rabbitService,
          traceId,
          {
            weekStart: weekStart,
            timezone: report.timezone,
            select: report.select,
            sorts: report.sorts,
            limit: report.limit,
            filters: report.combinedFilters,
            model: model,
            udfsDict: udfsDict
          }
        );

        report.sql = sql;
        report.filtersFractions = filtersFractions;
        report.varsSqlSteps = varsSqlSteps;
      }
    );

    let {
      apiDashboards,
      dashMconfigs,
      dashQueries
    } = barWrapper.wrapDashboards({
      structId: structId,
      organizationId: organizationId,
      projectId: projectId,
      models: models,
      dashboards: [dashboard]
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
