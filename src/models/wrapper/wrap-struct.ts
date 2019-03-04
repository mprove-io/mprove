import { ApStruct } from '../../barrels/ap-struct';
import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export async function wrapStruct(item: {
  dir: string,
  weekStart: api.ProjectWeekStartEnum,
  bqProject: string,
  projectId: string,
  repoId: string,
  structId: string,
}) {

  let struct: interfaces.Struct = await ApStruct.rebuildStruct({
    dir: item.dir,
    weekStart: item.weekStart,
    bqProject: item.bqProject,
    projectId: item.projectId,
    structId: item.structId
  });

  let wrappedErrors = this.wrapErrors({
    projectId: item.projectId,
    repoId: item.repoId,
    structId: item.structId,
    errors: struct.errors
  });

  let wrappedModels = this.wrapModels({
    projectId: item.projectId,
    repoId: item.repoId,
    structId: item.structId,
    models: struct.models
  });

  let wd = this.wrapDashboards({
    projectId: item.projectId,
    repoId: item.repoId,
    dashboards: struct.dashboards,
    structId: item.structId
  });

  let wrappedPdtsQueries = this.wrapPdts({
    projectId: item.projectId,
    pdts: struct.pdts,
    structId: item.structId
  });

  let wrappedQueries = [
    ...wd.wrappedDashboardsQueries,
    ...wrappedPdtsQueries
  ];

  let wrappedStruct: api.StructFull = {
    errors: wrappedErrors,
    models: wrappedModels,
    dashboards: wd.wrappedDashboards,
    mconfigs: wd.wrappedMconfigs,
    queries: wrappedQueries,
  };

  return {
    wrappedStruct: wrappedStruct,
    pdts_sorted: struct.pdts_sorted,
    udfsContent: JSON.stringify(struct.udfs),
  };

}
