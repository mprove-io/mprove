import { api } from '../../barrels/api';
import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { interfaces } from '../../barrels/interfaces';
import { store } from '../../barrels/store';

export async function copyStructFromDatabase(item: {
  project_id: string;
  from_repo_id: string;
  to_repo_id: string;
}): Promise<interfaces.ItemStructCopy> {
  let storeModels = store.getModelsRepo();
  let storeErrors = store.getErrorsRepo();
  let storeMconfigs = store.getMconfigsRepo();
  let storeDashboards = store.getDashboardsRepo();

  let modelsFrom = <entities.ModelEntity[]>await storeModels
    .find({
      project_id: item.project_id,
      repo_id: item.from_repo_id
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_MODELS_FIND));

  let errorsFrom = <entities.ErrorEntity[]>await storeErrors
    .find({
      project_id: item.project_id,
      repo_id: item.from_repo_id
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_ERRORS_FIND));

  let mconfigsFrom = <entities.MconfigEntity[]>await storeMconfigs
    .find({
      project_id: item.project_id,
      repo_id: item.from_repo_id
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_MCONFIGS_FIND));

  let dashboardsFrom = <entities.DashboardEntity[]>await storeDashboards
    .find({
      project_id: item.project_id,
      repo_id: item.from_repo_id
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_DASHBOARDS_FIND));

  let models: entities.ModelEntity[] = modelsFrom.map(model =>
    Object.assign({}, model, {
      repo_id: item.to_repo_id
    })
  );

  let errors: entities.ErrorEntity[] = errorsFrom.map(error =>
    Object.assign({}, error, {
      repo_id: item.to_repo_id,
      error_id: helper.makeId() // new error_id
    })
  );

  let mconfigIdsMap: { [id: string]: string } = {};

  mconfigsFrom.forEach(mconfig => {
    mconfigIdsMap[mconfig.mconfig_id] = helper.makeId();
  });

  let mconfigs: entities.MconfigEntity[] = mconfigsFrom.map(mconfig =>
    Object.assign({}, mconfig, {
      repo_id: item.to_repo_id,
      mconfig_id: mconfigIdsMap[mconfig.mconfig_id] // new mconfig_id
    })
  );

  let dashboards: entities.DashboardEntity[] = dashboardsFrom.map(dashboard =>
    Object.assign({}, dashboard, {
      repo_id: item.to_repo_id,
      reports: JSON.stringify(
        JSON.parse(dashboard.reports).map((x: api.Report) => {
          return {
            query_id: x.query_id,
            mconfig_id: mconfigIdsMap[x.mconfig_id] // new mconfig_id
          };
        })
      )
    })
  );

  return {
    models: models,
    dashboards: dashboards,
    mconfigs: mconfigs,
    errors: errors
  };
}
