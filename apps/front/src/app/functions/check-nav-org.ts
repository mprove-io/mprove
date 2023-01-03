import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';
import { common } from '~front/barrels/common';
import { NavState } from '../queries/nav.query';

export function checkNavOrg(item: {
  nav: NavState;
  route: ActivatedRouteSnapshot;
  router: Router;
}) {
  let { nav, route, router } = item;

  let parametersOrgId = route.params[common.PARAMETER_ORG_ID];

  if (common.isDefined(parametersOrgId) && nav.orgId !== parametersOrgId) {
    router.navigate([common.PATH_PROFILE]);
    return of(false);
  }
}
