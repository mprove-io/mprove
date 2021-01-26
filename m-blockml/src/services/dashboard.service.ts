import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import asyncPool from 'tiny-async-pool';
import { api } from '~/barrels/api';
import { barSpecial } from '~/barrels/bar-special';
import { barWrapper } from '~/barrels/bar-wrapper';
import { interfaces } from '~/barrels/interfaces';
import { RabbitService } from './rabbit.service';

@Injectable()
export class DashboardService {
  constructor(
    private rabbitService: RabbitService,
    private cs: ConfigService<interfaces.Config>
  ) {}

  async processDashboard(request: any) {
    if (
      request.info?.name !==
      api.ToBlockmlRequestInfoNameEnum.ToBlockmlProcessDashboard
    ) {
      throw new api.ServerError({
        message: api.ErEnum.M_BLOCKML_WRONG_REQUEST_INFO_NAME
      });
    }

    let reqValid = await api.transformValid({
      classType: api.ToBlockmlProcessDashboardRequest,
      object: request,
      errorMessage: api.ErEnum.M_BLOCKML_WRONG_REQUEST_PARAMS
    });

    let {
      structId,
      organizationId,
      projectId,
      weekStart,
      udfsDict,
      modelContents: models,
      dashboardContent: dashboard,
      newDashboardId,
      newDashboardFields
    } = reqValid.payload;

    let dashboardFilters: interfaces.FilterBricksDictionary = {};

    newDashboardFields.forEach(f => {
      let fieldId = f.id;
      let bricks = f.fractions.map(fraction => fraction.brick);
      dashboardFilters[fieldId] = bricks;
    });

    dashboard.filters = dashboardFilters;

    let concurrencyLimit = this.cs.get<
      interfaces.Config['blockmlConcurrencyLimit']
    >('blockmlConcurrencyLimit');

    await asyncPool(concurrencyLimit, dashboard.reports, async report => {
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
        this.cs,
        reqValid.info.traceId,
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
    });

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
