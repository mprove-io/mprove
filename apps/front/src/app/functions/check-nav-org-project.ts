import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';
import {
  PARAMETER_ORG_ID,
  PARAMETER_PROJECT_ID,
  PATH_ACCOUNT,
  PATH_ORG,
  PATH_PROFILE
} from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined';
import { NavState } from '../queries/nav.query';

export function checkNavOrgProject(item: {
  nav: NavState;
  route: ActivatedRouteSnapshot;
  router: Router;
}) {
  let { nav, route, router } = item;

  let parametersOrgId = route.params[PARAMETER_ORG_ID];
  let parametersProjectId = route.params[PARAMETER_PROJECT_ID];

  if (isDefined(parametersOrgId) && nav.orgId !== parametersOrgId) {
    router.navigate([PATH_PROFILE]);
    return of(false);
  }

  if (isDefined(parametersProjectId) && nav.projectId !== parametersProjectId) {
    router.navigate([PATH_ORG, nav.orgId, PATH_ACCOUNT]);
    return of(false);
  }
}
