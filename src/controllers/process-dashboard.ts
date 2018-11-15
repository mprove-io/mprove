import { Request, Response } from 'express';
import { api } from '../barrels/api';
import { interfaces } from '../barrels/interfaces';
import { special } from '../barrels/special';
import { wrapper } from '../barrels/wrapper';

export let processDashboard = async (req: Request, res: Response) => {
  let requestId: string;
  let structId;
  let bqProject;
  let projectId;
  let repoId;
  let weekStart;

  let udfs: interfaces.Udf[];
  let dashboard: interfaces.Dashboard;

  let newDashboardId;

  let newDashboardFields: api.DashboardField[];

  let cuts: {
    model_id: string;
    model_content: string;
  }[];

  try {
    requestId = req.body['info']['request_id'];

    structId = req.body['payload']['struct_id'];
    bqProject = req.body['payload']['bq_project'];
    projectId = req.body['payload']['project_id'];
    repoId = req.body['payload']['repo_id'];
    weekStart = req.body['payload']['week_start'];

    udfs = JSON.parse(req.body['payload']['udfs_content']);
    dashboard = JSON.parse(req.body['payload']['old_dashboard_content']);

    newDashboardId = req.body['payload']['new_dashboard_id'];

    newDashboardFields = req.body['payload']['new_dashboard_fields'];

    cuts = req.body['payload']['cuts'];
  } catch (e) {
    res.json({
      info: {
        origin: api.CommunicationOriginEnum.BLOCKML,
        type: api.CommunicationTypeEnum.RESPONSE,
        reply_to: requestId,
        status: 'blockml_wrong_request_params',
        error: {
          message: e.stack
        }
      },
      payload: undefined
    });
  }

  let queries;
  let mconfigs;
  let newDashboard;

  try {
    // create models
    let models: interfaces.Model[] = [];

    cuts.forEach(cut => {
      models.push(JSON.parse(cut.model_content));
    });

    // get new dashboard filters from fields
    let dashboardFilters: { [s: string]: string[] } = {};

    newDashboardFields.forEach(f => {
      let fieldId = f.id;

      let bricks: string[] = [];

      f.fractions.forEach(fraction => {
        bricks.push(fraction.brick);
      });

      dashboardFilters[fieldId] = bricks;
    });

    // replace old dashboard filters
    dashboard.filters = dashboardFilters;

    // replace bq views (replace report filters inside)
    dashboard = await special.bqViewsOnTheFly({
      dashboard: dashboard,
      models: models,
      dashboardFilters: dashboardFilters,
      weekStart: weekStart,
      bqProject: bqProject,
      projectId: projectId,
      udfs: udfs,
      structId: structId
    });

    let wd = wrapper.wrapDashboards({
      projectId: projectId,
      repoId: repoId,
      dashboards: [dashboard],
      structId: structId
    });

    let dashboards = wd.wrappedDashboards;
    queries = wd.wrappedDashboardsQueries;
    mconfigs = wd.wrappedMconfigs;

    newDashboard = dashboards[0];

    newDashboard.fields = newDashboardFields;
    newDashboard.dashboard_id = newDashboardId;
    newDashboard.temp = true;

    mconfigs.map(mconfig => {
      mconfig.temp = true;
      return mconfig;
    });

    queries.map(query => {
      query.temp = true;
      return query;
    });
  } catch (err) {
    res.json({
      info: {
        origin: api.CommunicationOriginEnum.BLOCKML,
        type: api.CommunicationTypeEnum.RESPONSE,
        reply_to: requestId,
        status: 'blockml_internal_error',
        error: {
          message: err.stack
        }
      },
      payload: undefined
    });
  }

  if (newDashboard && mconfigs && queries) {
    res.json({
      info: {
        origin: api.CommunicationOriginEnum.BLOCKML,
        type: api.CommunicationTypeEnum.RESPONSE,
        reply_to: requestId,
        status: 'ok'
      },
      payload: {
        dashboard: newDashboard, // dashboard->content->fields stays old (ok)
        mconfigs: mconfigs,
        queries: queries
      }
    });
  }
};
