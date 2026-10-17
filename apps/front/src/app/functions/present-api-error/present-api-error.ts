import type { Router } from '@angular/router';
import { BackendResponseError } from '#common/classes/backend-response-error/backend-response-error';
import {
  PATH_BRANCH,
  PATH_BUILDER,
  PATH_ENV,
  PATH_NEW_SESSION,
  PATH_ORG,
  PATH_PROJECT,
  PATH_REPO
} from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendResponse } from '#common/types/backend/response/to-backend-response';
import type { BuilderLeft } from '#common/types/front/builder/builder-left';
import type { ErrorData } from '#common/types/front/ui/error-data';
import type { NavQuery, NavState } from '#front/app/queries/nav.query';
import type { UiQuery } from '#front/app/queries/ui.query';
import type { MyDialogService } from '#front/app/services/my-dialog.service';
import type { NavigateService } from '#front/app/services/navigate.service';
import type {
  ApiRequestContext,
  ApiRequestFailure
} from '#front/app/types/api-request-failure';
import {
  type ApiNavigationTarget,
  navigateApiError
} from './navigate-api-error/navigate-api-error';

export function presentApiError<TResponse extends ToBackendResponse>(item: {
  failure: ApiRequestFailure<TResponse>;
  context: ApiRequestContext;
  router: Router;
  navQuery: NavQuery;
  uiQuery: UiQuery;
  myDialogService: MyDialogService;
  navigateService: NavigateService;
}): void {
  let {
    failure,
    context,
    router,
    navQuery,
    uiQuery,
    myDialogService,
    navigateService
  } = item;

  let errorData: ErrorData = {
    reqUrl: context.url,
    response: context.response,
    message: 'FRONT_RESPONSE_INFO_STATUS_IS_NOT_OK'
  };

  if ('context' in failure) {
    errorData.message =
      failure.error.code === 'FRONT_INVALID_BACKEND_RESPONSE'
        ? 'FRONT_API_UNKNOWN_ERROR'
        : failure.error.code === 'FRONT_REQUEST_TIMEOUT'
          ? 'FRONT_INSTANCE_OF_TIMEOUT_ERROR'
          : 'FRONT_INSTANCE_OF_HTTP_ERROR_RESPONSE';

    myDialogService.showError({ errorData: errorData, isThrow: false });

    return;
  }

  errorData.response = {
    body: failure,
    status: context.status
  };

  errorData.originalError = new BackendResponseError({
    response: failure
  });

  let error = failure.error;

  let nav: NavState = navQuery.getValue();

  let orgProjectPath: string = `/${PATH_ORG}/${nav.orgId}/${PATH_PROJECT}/${nav.projectId}/${PATH_REPO}/${nav.repoId}`;

  if (
    error.code === 'BACKEND_ERROR_RESPONSE_FROM_DISK' &&
    error.originalError?.code === 'DISK_REPO_IS_NOT_CLEAN_FOR_CHECKOUT_BRANCH'
  ) {
    let currentBranch: string = error.originalError.displayData?.currentBranch;

    if (isDefined(currentBranch)) {
      setTimeout(() => {
        let currentNav: NavState = navQuery.getValue();

        let start: string[] = [
          PATH_ORG,
          currentNav.orgId,
          PATH_PROJECT,
          currentNav.projectId,
          PATH_REPO,
          currentNav.repoId
        ];

        void router
          .navigateByUrl(start.join('/'), { skipLocationChange: true })
          .then(() => {
            void router.navigate(
              [
                ...start,
                PATH_BRANCH,
                currentBranch,
                PATH_ENV,
                currentNav.envId,
                PATH_BUILDER,
                PATH_NEW_SESSION
              ],
              {
                queryParams: { left: 'Tree' satisfies BuilderLeft }
              }
            );
          });

        myDialogService.showError({
          errorData: {
            message:
              'FRONT_CANNOT_SWITCH_BRANCH_WHILE_SELECTED_REPO_HAS_UNCOMMITTED_CHANGES'
          },
          isThrow: false
        });
      }, 0);
    }

    return;
  }

  if (error.code === 'BACKEND_REPORT_NOT_FOUND') {
    uiQuery.getValue().gridApi?.deselectAll();

    navigateApiError({
      path: orgProjectPath,
      target: 'reports',
      nav: nav,
      router: router,
      navigateService: navigateService
    });

    return;
  }

  if (
    error.code === 'BACKEND_MODEL_DOES_NOT_EXIST' ||
    error.code === 'BACKEND_CHART_DOES_NOT_EXIST'
  ) {
    navigateApiError({
      path: orgProjectPath,
      target: 'models',
      nav: nav,
      router: router,
      navigateService: navigateService
    });

    return;
  }

  if (error.code === 'BACKEND_DASHBOARD_DOES_NOT_EXIST') {
    navigateApiError({
      path: orgProjectPath,
      target: 'dashboards',
      nav: nav,
      router: router,
      navigateService: navigateService
    });

    return;
  }

  if (
    error.code === 'BACKEND_FORBIDDEN_DASHBOARD' ||
    error.code === 'BACKEND_FORBIDDEN_REPORT' ||
    error.code === 'BACKEND_FORBIDDEN_MODEL'
  ) {
    let target: ApiNavigationTarget =
      error.code === 'BACKEND_FORBIDDEN_DASHBOARD'
        ? 'dashboards'
        : error.code === 'BACKEND_FORBIDDEN_REPORT'
          ? 'reports'
          : 'models';

    errorData.description =
      error.code === 'BACKEND_FORBIDDEN_DASHBOARD'
        ? 'Check dashboard access rules'
        : error.code === 'BACKEND_FORBIDDEN_REPORT'
          ? 'Check report access rules'
          : 'Check model access rules';
    errorData.leftButtonText =
      target === 'models' ? 'Go to charts' : `Go to ${target}`;
    errorData.leftOnClickFnBindThis = () =>
      navigateApiError({
        path: orgProjectPath,
        target: target,
        nav: nav,
        router: router,
        navigateService: navigateService
      });
  } else if (error.code === 'BACKEND_FORBIDDEN_REPO_ID') {
    errorData.message = 'Session is not found';
    errorData.leftButtonText = 'Ok';
    errorData.leftOnClickFnBindThis = () =>
      navigateApiError({
        path: orgProjectPath,
        target: 'session',
        nav: nav,
        router: router,
        navigateService: navigateService
      });
  } else if (
    error.code === 'BACKEND_MCONFIG_DOES_NOT_EXIST' ||
    error.code === 'BACKEND_QUERY_DOES_NOT_EXIST' ||
    error.code === 'BACKEND_STRUCT_ID_CHANGED' ||
    error.code === 'BACKEND_STRUCT_DOES_NOT_EXIST'
  ) {
    errorData.description = 'Reload to get changes';
    errorData.leftButtonText = 'Reload';
    errorData.leftOnClickFnBindThis = () =>
      navigateApiError({
        path: orgProjectPath,
        target: 'models',
        nav: nav,
        router: router,
        navigateService: navigateService
      });
  } else if (error.code === 'BACKEND_CODEX_AUTH_SIGN_IN_REQUIRED') {
    errorData.description =
      'Sign in to ChatGPT on user profile page to refresh auth';
  } else if (error.code === 'BACKEND_RESTRICTED_USER') {
    errorData.description =
      'Demo user is restricted. Sign Up at https://mprove.io to create your own project.';
  } else if (error.code === 'BACKEND_RESTRICTED_PROJECT') {
    errorData.description =
      'Some actions of Demo project are restricted. Switch organization project to remove restrictions.';
  } else if (error.code === 'BACKEND_ROLES_DO_NOT_EXIST') {
    let missingRoles: string[] = error.displayData?.roles;

    let missingRolesText: string = Array.isArray(missingRoles)
      ? missingRoles.join(', ')
      : '';

    errorData.message =
      missingRolesText.length > 0
        ? `Roles do not exist: ${missingRolesText}`
        : 'Roles do not exist';
  } else if (
    error.code === 'BACKEND_CREATE_DASHBOARD_FAIL' ||
    error.code === 'BACKEND_MODIFY_DASHBOARD_FAIL' ||
    error.code === 'BACKEND_CREATE_CHART_FAIL' ||
    error.code === 'BACKEND_MODIFY_CHART_FAIL' ||
    error.code === 'BACKEND_CREATE_REPORT_FAIL' ||
    error.code === 'BACKEND_MODIFY_REPORT_FAIL'
  ) {
    errorData.description =
      "The changes were saved to the file, but it failed the validation. It's probably a bug.";
    errorData.leftButtonText = 'Go to File';
    errorData.leftOnClickFnBindThis = () => {
      void router
        .navigateByUrl(orgProjectPath, { skipLocationChange: true })
        .then(() => {
          let encodedFileId: string = error.displayData?.encodedFileId;

          if (isDefined(encodedFileId)) {
            void navigateService.navigateToFileLine({
              builderLeft: 'Tree',
              encodedFileId: encodedFileId
            });
          } else {
            void navigateService.navigateToBuilder({
              branchId: nav.branchId
            });
          }
        });
    };
  }

  myDialogService.showError({ errorData: errorData, isThrow: false });
}
