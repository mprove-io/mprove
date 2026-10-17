import type { Router } from '@angular/router';
import {
  PATH_BRANCH,
  PATH_BUILDER,
  PATH_ENV,
  PATH_NEW_SESSION,
  PATH_ORG,
  PATH_PROJECT,
  PATH_REPO,
  PROD_REPO_ID
} from '#common/constants/top';
import type { NavState } from '#front/app/queries/nav.query';
import type { NavigateService } from '#front/app/services/navigate.service';

const apiNavigationTargetValues = [
  'reports',
  'models',
  'dashboards',
  'session'
] as const;

export type ApiNavigationTarget = (typeof apiNavigationTargetValues)[number];

export function navigateApiError(item: {
  path: string;
  target: ApiNavigationTarget;
  nav: NavState;
  router: Router;
  navigateService: NavigateService;
}): void {
  let { path, target, nav, router, navigateService } = item;

  void router.navigateByUrl(path, { skipLocationChange: true }).then(() => {
    if (target === 'reports') {
      void navigateService.navigateToReports();
    } else if (target === 'models') {
      void navigateService.navigateToModels();
    } else if (target === 'dashboards') {
      void navigateService.navigateToDashboards();
    } else {
      void router.navigate([
        PATH_ORG,
        nav.orgId,
        PATH_PROJECT,
        nav.projectId,
        PATH_REPO,
        PROD_REPO_ID,
        PATH_BRANCH,
        nav.projectDefaultBranch,
        PATH_ENV,
        nav.envId,
        PATH_BUILDER,
        PATH_NEW_SESSION
      ]);
    }
  });
}
