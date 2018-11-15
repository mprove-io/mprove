import { AxiosResponse } from 'axios';
import { api } from '../../barrels/api';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { interfaces } from '../../barrels/interfaces';
import { wrapper } from '../../barrels/wrapper';
import { constantAxiosInstance } from './_constant-axios-instance';

export async function processDashboard(item: {
  project_id: string;
  repo_id: string;
  bq_project: string;
  week_start: string;
  old_dashboard_content: string;
  udfs_content: string;
  new_dashboard_id: string;
  new_dashboard_fields: api.DashboardField[];
  cuts: api.Cut[];
  struct_id: string;
}): Promise<interfaces.ItemProcessDashboard> {
  let requestPayload: api.ProcessDashboardRequestBodyPayload = {
    project_id: item.project_id,
    repo_id: item.repo_id,
    bq_project: item.bq_project,
    week_start: <any>item.week_start,
    old_dashboard_content: item.old_dashboard_content,
    udfs_content: item.udfs_content,
    new_dashboard_id: item.new_dashboard_id,
    new_dashboard_fields: item.new_dashboard_fields,
    cuts: item.cuts,
    struct_id: item.struct_id
  };

  let request = wrapper.wrapBlockmlRequest(requestPayload);

  let response: AxiosResponse<api.ProcessDashboardResponse200Body>;

  response = <any>(
    await constantAxiosInstance
      .post('processDashboard', request)
      .catch(e =>
        helper.reThrow(
          e,
          enums.axiosErrorsEnum.AXIOS_BLOCKML_POST_PROCESS_DASHBOARD
        )
      )
  );

  let payload: api.ProcessDashboardResponse200BodyPayload =
    response.data.payload;

  let dashboard = wrapper.wrapToEntityDashboard(payload.dashboard);

  let mconfigs = payload.mconfigs.map(mconfigApi => {
    let mconfig = wrapper.wrapToEntityMconfig(mconfigApi);
    return mconfig;
  });

  let queries = payload.queries.map(queryApi => {
    let query = wrapper.wrapToEntityQuery(queryApi);
    return query;
  });

  return {
    dashboard: dashboard,
    mconfigs: mconfigs,
    queries: queries
  };
}
