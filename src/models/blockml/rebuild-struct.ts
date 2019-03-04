import { AxiosResponse } from 'axios';
import { api } from '../../barrels/api';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { interfaces } from '../../barrels/interfaces';
import { wrapper } from '../../barrels/wrapper';
import { constantAxiosInstance } from './_constant-axios-instance';

export async function rebuildStruct(item: {
  project_id: string;
  repo_id: string;
  bq_project: string;
  week_start: api.ProjectWeekStartEnum;
  struct_id: string;
}): Promise<interfaces.ItemStruct> {

  let requestPayload: api.RebuildStructRequestBodyPayload = {
    project_id: item.project_id,
    repo_id: item.repo_id,
    bq_project: item.bq_project,
    week_start: item.week_start,
    struct_id: item.struct_id
  };

  let request = wrapper.wrapBlockmlRequest(requestPayload);

  let response: AxiosResponse<api.RebuildStructResponse200Body>;

  response = <any>await constantAxiosInstance.post('rebuildStruct', request)
    .catch(e => helper.reThrow(e, enums.axiosErrorsEnum.AXIOS_BLOCKML_REBUILD_STRUCT));

  let payload: api.RebuildStructResponse200BodyPayload = response.data.payload;

  let models = payload.struct.models.map(modelApi => {
    let model = wrapper.wrapToEntityModel(modelApi);

    return model;
  });

  let dashboards = payload.struct.dashboards.map(dashboardApi => {
    let dashboard = wrapper.wrapToEntityDashboard(dashboardApi);

    return dashboard;
  });

  let mconfigs = payload.struct.mconfigs.map(mconfigApi => {
    let mconfig = wrapper.wrapToEntityMconfig(mconfigApi);

    return mconfig;
  });

  let errors = payload.struct.errors.map(errorApi => {
    let error = wrapper.wrapToEntityError(errorApi);

    return error;
  });

  let queries = payload.struct.queries.map(queryApi => {
    let query = wrapper.wrapToEntityQuery(queryApi);

    return query;
  });

  let udfsContent = payload.udfs_content;
  let pdtsSorted = JSON.stringify(payload.pdts_sorted);

  return {
    models: models,
    dashboards: dashboards,
    mconfigs: mconfigs,
    errors: errors,
    queries: queries,
    udfs_content: udfsContent,
    pdts_sorted: pdtsSorted,
  };
}
