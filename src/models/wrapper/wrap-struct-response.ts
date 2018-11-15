import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';
import { wrapToApiDashboard } from './wrap-to-api/wrap-to-api-dashboard';
import { wrapToApiError } from './wrap-to-api/wrap-to-api-error';
import { wrapToApiModel } from './wrap-to-api/wrap-to-api-model';
import { wrapToApiRepo } from './wrap-to-api/wrap-to-api-repo';

export function wrapStructResponse(
  struct: interfaces.ItemStructAndRepo
): api.Struct {
  return {
    errors: struct.errors.map(error => wrapToApiError(error)),
    models: struct.models.map(model => wrapToApiModel(model)),
    dashboards: struct.dashboards.map(dashboard =>
      wrapToApiDashboard(dashboard)
    ),
    repo: wrapToApiRepo(struct.repo)
  };
}
