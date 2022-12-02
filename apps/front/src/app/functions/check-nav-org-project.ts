import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';
import { common } from '~front/barrels/common';
import { NavState } from '../stores/nav.store';

export function checkNavOrgProject(item: {
  nav: NavState;
  route: ActivatedRouteSnapshot;
  router: Router;
}) {
  let { nav, route, router } = item;

  let parametersOrgId = route.params[common.PARAMETER_ORG_ID];
  let parametersProjectId = route.params[common.PARAMETER_PROJECT_ID];

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
}
