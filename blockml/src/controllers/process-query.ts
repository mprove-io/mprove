import { Request, Response } from 'express';
import { api } from '../barrels/api';
import { interfaces } from '../barrels/interfaces';
import { genSql } from '../barrels/gen-sql';

export let processQuery = async (req: Request, res: Response) => {
  let requestId: string;

  let structId;
  let bqProject;
  let projectId;
  let weekStart;
  let model;
  let udfs;

  let queryId;
  let select;
  let sorts;
  let timezone;
  let limit;

  let mconfig: api.Mconfig;

  let mconfigFilters: {
    field_id: string;
    fractions: api.Fraction[];
  }[];

  try {
    requestId = req.body['info']['request_id'];

    structId = req.body['payload']['struct_id'];
    bqProject = req.body['payload']['bigquery_project'];
    projectId = req.body['payload']['project_id'];
    weekStart = req.body['payload']['week_start'];
    model = JSON.parse(req.body['payload']['model_content']);
    udfs = JSON.parse(req.body['payload']['udfs_content']);

    queryId = req.body['payload']['mconfig']['query_id'];
    select = req.body['payload']['mconfig']['select'];
    sorts = req.body['payload']['mconfig']['sorts'];
    timezone = req.body['payload']['mconfig']['timezone'];
    limit = req.body['payload']['mconfig']['limit'];

    mconfig = req.body['payload']['mconfig'];

    mconfigFilters = req.body['payload']['mconfig']['filters'];
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

  let query: api.Query;

  try {
    let filters: { [s: string]: string[] } = {};

    mconfigFilters.forEach(f => {
      let fieldId = f.field_id;

      let bricks: string[] = [];

      f.fractions.forEach(fraction => {
        bricks.push(fraction.brick);
      });

      filters[fieldId] = bricks;
    });

    let resItem: interfaces.ItemGenBqViews = await genSql.genBqViews({
      model: model,
      select: select,
      sorts: sorts,
      timezone: timezone,
      limit: limit,
      filters: filters,
      weekStart: weekStart,
      bqProject: bqProject,
      projectId: projectId,
      udfs_user: udfs,
      structId: structId
    });

    let filtersFractions = <any>resItem.filters_fractions;
    let bqViews = resItem.bq_views;

    let newMconfigFilters: {
      field_id: string;
      fractions: api.Fraction[];
    }[] = [];

    Object.keys(filtersFractions).forEach(fieldId => {
      newMconfigFilters.push({
        field_id: fieldId,
        fractions: filtersFractions[fieldId]
      });
    });

    mconfig.filters = newMconfigFilters; // like in wrap

    query = {
      query_id: queryId,
      project_id: projectId,
      struct_id: structId,
      pdt_deps: bqViews[0].pdt_deps,
      pdt_deps_all: bqViews[0].pdt_deps_all,
      sql: bqViews[0].sql,
      is_pdt: false,
      pdt_trigger_sql: undefined,
      pdt_trigger_time: undefined,
      pdt_id: null,
      status: api.QueryStatusEnum.New,
      last_run_by: undefined,
      last_run_ts: 1,
      last_cancel_ts: 1,
      last_complete_ts: 1,
      last_complete_duration: undefined,
      last_error_message: undefined,
      last_error_ts: 1,
      data: undefined,
      temp: true,
      server_ts: 1
    };
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

  if (mconfig && query) {
    res.json({
      info: {
        origin: api.CommunicationOriginEnum.BLOCKML,
        type: api.CommunicationTypeEnum.RESPONSE,
        reply_to: requestId,
        status: 'ok'
      },
      payload: {
        mconfig: mconfig,
        query: query
      }
    });
  }
};
