import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import asyncPool from 'tiny-async-pool';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { barSpecial } from '~blockml/barrels/bar-special';
import { barWrapper } from '~blockml/barrels/bar-wrapper';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { RabbitService } from '~blockml/services/rabbit.service';

@Injectable()
export class ProcessDashboardService {
  constructor(
    private rabbitService: RabbitService,
    private cs: ConfigService<interfaces.Config>
  ) {}

  async process(request: any) {
    if (
      request.info?.name !==
      apiToBlockml.ToBlockmlRequestInfoNameEnum.ToBlockmlProcessDashboard
    ) {
      throw new common.ServerError({
        message: apiToBlockml.ErEnum.BLOCKML_WRONG_REQUEST_INFO_NAME
      });
    }

    let reqValid = await common.transformValid({
      classType: apiToBlockml.ToBlockmlProcessDashboardRequest,
      object: request,
      errorMessage: apiToBlockml.ErEnum.BLOCKML_WRONG_REQUEST_PARAMS
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

    let concurrencyLimit = this.cs.get<interfaces.Config['concurrencyLimit']>(
      'concurrencyLimit'
    );

    await asyncPool(concurrencyLimit, dashboard.reports, async report => {
      let filters: interfaces.FilterBricksDictionary = {};

      Object.keys(report.default_filters)
        .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
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

    let payload: apiToBlockml.ToBlockmlProcessDashboardResponsePayload = {
      dashboard: newDashboard,
      mconfigs: dashMconfigs,
      queries: dashQueries
    };

    return payload;
  }
}
