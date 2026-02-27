import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';
import {
  PARAMETER_BRANCH_ID,
  PARAMETER_ENV_ID,
  PARAMETER_ORG_ID,
  PARAMETER_PROJECT_ID,
  PARAMETER_REPO_ID,
  PATH_ACCOUNT,
  PATH_INFO,
  PATH_ORG,
  PATH_PROFILE,
  PATH_PROJECT,
  PROD_REPO_ID
} from '#common/constants/top';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { NavState } from '../queries/nav.query';

export function checkNavOrgProjectRepoBranchEnv(item: {
  nav: NavState;
  route: ActivatedRouteSnapshot;
  router: Router;
  userId: string;
}) {
  let { nav, route, router, userId } = item;

  let parametersOrgId = route.params[PARAMETER_ORG_ID];
  let parametersProjectId = route.params[PARAMETER_PROJECT_ID];
  let parametersRepoId = route.params[PARAMETER_REPO_ID];
  let parametersBranchId = route.params[PARAMETER_BRANCH_ID];
  let parametersEnvId = route.params[PARAMETER_ENV_ID];

  if (isDefined(parametersOrgId) && nav.orgId !== parametersOrgId) {
    router.navigate([PATH_PROFILE]);
    return of(false);
  }

  if (isDefined(parametersProjectId) && nav.projectId !== parametersProjectId) {
    router.navigate([PATH_ORG, nav.orgId, PATH_ACCOUNT]);
    return of(false);
  }

  if (isDefined(parametersRepoId)) {
    if (
      (nav.repoType === RepoTypeEnum.Prod &&
        parametersRepoId !== PROD_REPO_ID) ||
      nav.branchId !== parametersBranchId ||
      nav.envId !== parametersEnvId
    ) {
      router.navigate([
        PATH_ORG,
        nav.orgId,
        PATH_PROJECT,
        nav.projectId,
        PATH_INFO
      ]);
      return of(false);
    }
  }
}
