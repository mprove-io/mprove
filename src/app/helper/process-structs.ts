import * as actions from 'app/store/actions/_index';
import * as api from 'app/api/_index';

export function processStructsHelper(structs: api.Struct[]) {
  let repos: api.Repo[] = [];
  let errors: api.SwError[] = [];
  let models: api.Model[] = [];
  let dashboards: api.Dashboard[] = [];

  structs.forEach(struct => {
    repos = repos.concat([struct.repo]);
    errors = errors.concat(struct.errors);
    models = models.concat(struct.models);
    dashboards = dashboards.concat(struct.dashboards);
  });

  return [
    new actions.UpdateReposStateAction(repos), // 2
    new actions.UpdateErrorsStateAction(errors), // 3
    new actions.UpdateModelsStateAction(models), // 3
    new actions.UpdateDashboardsStateAction(dashboards) // 5
  ];
}
