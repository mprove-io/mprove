import { ApStruct } from '../../barrels/ap-struct';
import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';
import { wrapErrors } from './wrap-errors';
import { wrapModels } from './wrap-models';
import { wrapDashboards } from './wrap-dashboards';
import { wrapPdts } from './wrap-pdts';
import { wrapViews } from './wrap-views';

export async function wrapStruct(item: {
  files: api.File[];
  weekStart: api.ProjectWeekStartEnum;
  bqProject: string;
  projectId: string;
  repoId: string;
  structId: string;
}) {
  let struct: interfaces.Struct = await ApStruct.rebuildStructStateless({
    files: item.files,
    weekStart: item.weekStart,
    bqProject: item.bqProject,
    projectId: item.projectId,
    structId: item.structId
  });

  let wrappedErrors = wrapErrors({
    projectId: item.projectId,
    repoId: item.repoId,
    structId: item.structId,
    errors: struct.errors
  });

  let wrappedModels = wrapModels({
    projectId: item.projectId,
    repoId: item.repoId,
    structId: item.structId,
    models: struct.models
  });

  let wrappedViews = wrapViews({
    projectId: item.projectId,
    repoId: item.repoId,
    structId: item.structId,
    views: struct.views
  });

  let wd = wrapDashboards({
    projectId: item.projectId,
    repoId: item.repoId,
    dashboards: struct.dashboards,
    structId: item.structId
  });

  let wrappedPdtsQueries = wrapPdts({
    projectId: item.projectId,
    pdts: struct.pdts,
    structId: item.structId
  });

  let wrappedQueries = [...wd.wrappedDashboardsQueries, ...wrappedPdtsQueries];

  let wrappedStruct: api.StructFull = {
    errors: wrappedErrors,
    models: wrappedModels,
    views: wrappedViews,
    dashboards: wd.wrappedDashboards,
    mconfigs: wd.wrappedMconfigs,
    queries: wrappedQueries
  };

  return {
    wrappedStruct: wrappedStruct,
    pdts_sorted: struct.pdts_sorted,
    udfsContent: JSON.stringify(struct.udfs)
  };
}
