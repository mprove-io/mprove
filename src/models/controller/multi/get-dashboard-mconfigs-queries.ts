import { Request, Response } from 'express';
import { In } from 'typeorm';
import { api } from '../../../barrels/api';
import { entities } from '../../../barrels/entities';
import { enums } from '../../../barrels/enums';
import { helper } from '../../../barrels/helper';
import { sender } from '../../../barrels/sender';
import { store } from '../../../barrels/store';
import { validator } from '../../../barrels/validator';
import { wrapper } from '../../../barrels/wrapper';
import { ServerError } from '../../server-error';

export async function getDashboardMconfigsQueries(req: Request, res: Response) {
  let payload: api.GetDashboardMconfigsQueriesRequestBodyPayload = validator.getPayload(
    req
  );

  let projectId = payload.project_id;
  let repoId = payload.repo_id;
  let dashboardId = payload.dashboard_id;

  let storeDashboards = store.getDashboardsRepo();

  let dashboard = <entities.DashboardEntity>await storeDashboards
    .findOne({
      project_id: projectId,
      repo_id: repoId,
      dashboard_id: dashboardId
    })
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_DASHBOARDS_FIND_ONE)
    );

  if (!dashboard) {
    throw new ServerError({ name: enums.otherErrorsEnum.DASHBOARD_NOT_FOUND });
  }

  let reports: api.Report[] = JSON.parse(dashboard.reports);
  let mconfigIds = reports.map(report => report.mconfig_id);
  let queryIds = reports.map(report => report.query_id);

  let mconfigs: entities.MconfigEntity[] = [];

  let storeMconfigs = store.getMconfigsRepo();

  if (mconfigIds.length > 0) {
    mconfigs = <entities.MconfigEntity[]>await storeMconfigs
      .find({
        mconfig_id: In(mconfigIds)
      })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_MCONFIGS_FIND));
  }

  let queries: entities.QueryEntity[] = [];

  let storeQueries = store.getQueriesRepo();

  if (queryIds.length > 0) {
    queries = <entities.QueryEntity[]>await storeQueries
      .find({
        query_id: In(queryIds)
      })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_FIND));
  }

  // response

  let responsePayload: api.GetDashboardMconfigsQueriesResponse200BodyPayload = {
    dashboard_or_empty: [wrapper.wrapToApiDashboard(dashboard)],
    dashboard_mconfigs: mconfigs.map(mconfig =>
      wrapper.wrapToApiMconfig(mconfig)
    ),
    dashboard_queries: queries.map(query => wrapper.wrapToApiQuery(query))
  };

  sender.sendClientResponse(req, res, responsePayload);
}
