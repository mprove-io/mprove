import { AxiosResponse } from 'axios';
import { api } from '../../barrels/api';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { interfaces } from '../../barrels/interfaces';
import { wrapper } from '../../barrels/wrapper';
import { constantAxiosInstance } from './_constant-axios-instance';
import { entities } from '../../barrels/entities';
import { MyRegex } from '../my-regex';

export async function rebuildStruct(item: {
  files: entities.FileEntity[];
  project_id: string;
  repo_id: string;
  bigquery_project: string;
  week_start: api.ProjectWeekStartEnum;
  struct_id: string;
}): Promise<interfaces.ItemStruct> {
  let apiFiles: api.File[] = item.files
    .filter(x => !x.name.match(MyRegex.ENDS_WITH_MD()))
    .map(x => {
      let path = x.file_id;

      let pReg = MyRegex.SLASH_G();
      path = path.replace(pReg, '___');

      let file = {
        name: x.name,
        path: path,
        content: x.content
      };

      return file;
    });

  let requestPayload: api.RebuildStructRequestBody['payload'] = {
    files: apiFiles,
    project_id: item.project_id,
    repo_id: item.repo_id,
    bigquery_project: item.bigquery_project,
    week_start: item.week_start,
    struct_id: item.struct_id
  };

  let request = wrapper.wrapBlockmlRequest(requestPayload);

  let response: AxiosResponse<api.RebuildStructResponse200Body>;

  response = <any>(
    await constantAxiosInstance
      .post('rebuildStruct', request)
      .catch(e =>
        helper.reThrow(e, enums.axiosErrorsEnum.AXIOS_BLOCKML_REBUILD_STRUCT)
      )
  );

  let payload: api.RebuildStructResponse200Body['payload'] =
    response.data.payload;

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
    pdts_sorted: pdtsSorted
  };
}
