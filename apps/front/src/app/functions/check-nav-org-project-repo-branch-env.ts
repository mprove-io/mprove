import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';
import { common } from '~front/barrels/common';
import { NavState } from '../queries/nav.query';

export function checkNavOrgProjectRepoBranchEnv(item: {
  nav: NavState;
  route: ActivatedRouteSnapshot;
  router: Router;
  userId: string;
}) {
  let { nav, route, router, userId } = item;

  let parametersOrgId = route.params[common.PARAMETER_ORG_ID];
  let parametersProjectId = route.params[common.PARAMETER_PROJECT_ID];
  let parametersRepoId = route.params[common.PARAMETER_REPO_ID];
  let parametersBranchId = route.params[common.PARAMETER_BRANCH_ID];
  let parametersEnvId = route.params[common.PARAMETER_ENV_ID];

  if (common.isDefined(parametersOrgId) && nav.orgId !== parametersOrgId) {
    router.navigate([common.PATH_PROFILE]);
    return of(false);
  }

  if (
    common.isDefined(parametersProjectId) &&
    nav.projectId !== parametersProjectId
  ) {
    router.navigate([common.PATH_ORG, nav.orgId, common.PATH_ACCOUNT]);
    return of(false);
  }

  if (common.isDefined(parametersRepoId)) {
    if (
      (nav.isRepoProd === true && parametersRepoId !== common.PROD_REPO_ID) ||
      (nav.isRepoProd === false && parametersRepoId !== userId) ||
      nav.branchId !== parametersBranchId ||
      nav.envId !== parametersEnvId
    ) {
      router.navigate([
        common.PATH_ORG,
        nav.orgId,
        common.PATH_PROJECT,
        nav.projectId,
        common.PATH_SETTINGS
      ]);
      return of(false);
    }
  }
}
