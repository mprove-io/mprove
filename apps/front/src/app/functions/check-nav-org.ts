import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';
import { PARAMETER_ORG_ID, PATH_PROFILE } from '~common/constants/top';
import { isDefined } from '~common/functions/is-defined';
import { NavState } from '../queries/nav.query';

export function checkNavOrg(item: {
  nav: NavState;
  route: ActivatedRouteSnapshot;
  router: Router;
}) {
  let { nav, route, router } = item;

  let parametersOrgId = route.params[PARAMETER_ORG_ID];

  if (isDefined(parametersOrgId) && nav.orgId !== parametersOrgId) {
    router.navigate([PATH_PROFILE]);
    return of(false);
  }
}
