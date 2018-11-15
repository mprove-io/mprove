import { AxiosResponse } from 'axios';
import { api } from '../../barrels/api';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { interfaces } from '../../barrels/interfaces';
import { wrapper } from '../../barrels/wrapper';
import { constantAxiosInstance } from './_constant-axios-instance';

export async function processQuery(item: {
  project_id: string;
  bq_project: string;
  week_start: api.ProjectWeekStartEnum;
  mconfig: api.Mconfig;
  model_content: string;
  udfs_content: string;
  struct_id: string;
}): Promise<interfaces.ItemProcessQuery> {
  let requestPayload: api.ProcessQueryRequestBodyPayload = {
    project_id: item.project_id,
    bq_project: item.bq_project,
    week_start: item.week_start,
    mconfig: item.mconfig,
    model_content: item.model_content,
    udfs_content: item.udfs_content,
    struct_id: item.struct_id
  };

  let request = wrapper.wrapBlockmlRequest(requestPayload);

  let response: AxiosResponse<api.ProcessQueryResponse200Body>;

  response = <any>(
    await constantAxiosInstance
      .post('processQuery', request)
      .catch(e =>
        helper.reThrow(
          e,
          enums.axiosErrorsEnum.AXIOS_BLOCKML_POST_PROCESS_QUERY
        )
      )
  );

  let payload: api.ProcessQueryResponse200BodyPayload = response.data.payload;

  let mconfig = wrapper.wrapToEntityMconfig(payload.mconfig);

  let query = wrapper.wrapToEntityQuery(payload.query);

  return {
    mconfig: mconfig,
    query: query
  };
}
