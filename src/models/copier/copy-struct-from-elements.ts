import { api } from '../../barrels/api';
import { entities } from '../../barrels/entities';
import { helper } from '../../barrels/helper';

// sync
export function copyStructFromElements(
  repoId: string,
  item: {
    models: entities.ModelEntity[];
    dashboards: entities.DashboardEntity[];
    mconfigs: entities.MconfigEntity[];
    errors: entities.ErrorEntity[];
  }
) {
  let models: entities.ModelEntity[] = item.models.map(model =>
    Object.assign({}, model, {
      repo_id: repoId
    })
  );

  let errors: entities.ErrorEntity[] = item.errors.map(error =>
    Object.assign({}, error, {
      repo_id: repoId,
      error_id: helper.makeId() // new error_id
    })
  );

  let mconfigIdsMap: { [id: string]: string } = {};

  item.mconfigs.forEach(mconfig => {
    mconfigIdsMap[mconfig.mconfig_id] = helper.makeId();
  });

  let mconfigs: entities.MconfigEntity[] = item.mconfigs.map(mconfig =>
    Object.assign({}, mconfig, {
      repo_id: repoId,
      mconfig_id: mconfigIdsMap[mconfig.mconfig_id] // new mconfig_id
    })
  );

  let dashboards: entities.DashboardEntity[] = item.dashboards.map(dashboard =>
    Object.assign({}, dashboard, {
      repo_id: repoId,
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
