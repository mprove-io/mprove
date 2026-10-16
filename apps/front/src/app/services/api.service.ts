import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  type HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Result } from '@praha/byethrow';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  combineLatest,
  defer,
  EMPTY,
  from,
  type MonoTypeOperatorFunction,
  type Observable,
  of,
  TimeoutError,
  throwError,
  timer
} from 'rxjs';
import { catchError, concatMap, finalize, map } from 'rxjs/operators';
import { BackendResponseError } from '#common/classes/backend-response-error/backend-response-error';
import {
  PATH_BRANCH,
  PATH_BUILDER,
  PATH_ENV,
  PATH_INFO,
  PATH_NEW_SESSION,
  PATH_ORG,
  PATH_PROJECT,
  PATH_REPO,
  PROD_REPO_ID
} from '#common/constants/top';
import {
  APP_SPINNER_NAME,
  LOCAL_STORAGE_TOKEN,
  MIN_TIME_TO_SPIN,
  SPECIAL_ERROR
} from '#common/constants/top-front';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeId } from '#common/functions/make-id/make-id';
import { makeToBackendRequest } from '#common/functions/make-to-backend-request/make-to-backend-request';
import type { ToBackendInputForRoute } from '#common/types/backend/request/to-backend-input-for-route';
import type { ToBackendRequest } from '#common/types/backend/request/to-backend-request';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendOutputForRoute } from '#common/types/backend/response/to-backend-output-for-route';
import type { ToBackendResponse } from '#common/types/backend/response/to-backend-response';
import type { ToBackendResponseForRoute } from '#common/types/backend/response/to-backend-response-for-route';
import type { BuilderLeft } from '#common/types/front/builder/builder-left';
import type { ErrorData } from '#common/types/front/ui/error-data';
import { environment } from '#front/environments/environment';
import { MemberQuery } from '../queries/member.query';
import { ModelsQuery } from '../queries/models.query';
import { NavQuery, type NavState } from '../queries/nav.query';
import { ReportsQuery } from '../queries/reports.query';
import { StructQuery } from '../queries/struct.query';
import { UiQuery } from '../queries/ui.query';
import type { ApiFailureDecision } from '../types/api-failure-decision';
import type {
  ApiRequestContext,
  ApiRequestFailure
} from '../types/api-request-failure';
import type { ApiRequestResult } from '../types/api-request-result';
import { AuthService } from './auth.service';
import { MyDialogService } from './my-dialog.service';
import { NavigateService } from './navigate.service';

const apiNavigationTargetValues = [
  'reports',
  'models',
  'dashboards',
  'session'
] as const;

type ApiNavigationTarget = (typeof apiNavigationTargetValues)[number];

// Expose the variants so inline discriminator checks also narrow generic routes.
type ApiResponse<TResponse extends ToBackendResponse> =
  | Extract<TResponse, { type: 'Success' }>
  | Extract<ApiRequestFailure<TResponse>, { type: 'backend' }>['response'];

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(
    private router: Router,
    private navQuery: NavQuery,
    private authHttpClient: HttpClient,
    private spinner: NgxSpinnerService,
    private uiQuery: UiQuery,
    private myDialogService: MyDialogService,
    private navigateService: NavigateService,
    private authService: AuthService,
    private reportsQuery: ReportsQuery,
    private modelsQuery: ModelsQuery,
    private structQuery: StructQuery,
    private memberQuery: MemberQuery
  ) {}

  private headers(item: { route: ToBackendRoute }): HttpHeaders {
    let { route } = item;

    let headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization:
        route === 'api/ToBackendLoginUser'
          ? ''
          : `Bearer ${localStorage.getItem(LOCAL_STORAGE_TOKEN)}`
    });

    return headers;
  }

  /** Compatibility-only envelope API. New UI callers use reqOutput or reqResult. */
  req<TRoute extends ToBackendRoute>(item: {
    route: TRoute;
    payload: ToBackendInputForRoute<NoInfer<TRoute>>;
    showSpinner?: boolean;
  }): Observable<ToBackendResponseForRoute<TRoute>> {
    let { route, payload, showSpinner } = item;

    let headers: HttpHeaders = this.headers({ route: route });

    let url: string = `${environment.httpUrl}/${route}`;

    let body: ToBackendRequest = makeToBackendRequest({
      route: route,
      traceId: makeId(),
      idempotencyKey: makeId(),
      input: payload
    });

    if (showSpinner === true) {
      void this.spinner.show(APP_SPINNER_NAME);
    }

    let response: Observable<ToBackendResponseForRoute<TRoute>> = combineLatest(
      [
        timer(showSpinner === true ? MIN_TIME_TO_SPIN : 0),
        this.authHttpClient.request<
          ApiResponse<ToBackendResponseForRoute<TRoute>>
        >('post', url, {
          headers: headers,
          body: body,
          observe: 'response'
        })
      ]
    ).pipe(
      map(x =>
        this.mapLegacyResponse<ToBackendResponseForRoute<TRoute>>({
          res: x[1],
          url: url,
          body: body
        })
      ),
      catchError((error: unknown) => {
        if (
          !(error instanceof HttpErrorResponse) &&
          !(error instanceof TimeoutError)
        ) {
          return throwError(() => error);
        }

        this.presentError({
          errorData: {
            originalError: error,
            message:
              error instanceof TimeoutError
                ? 'FRONT_INSTANCE_OF_TIMEOUT_ERROR'
                : 'FRONT_INSTANCE_OF_HTTP_ERROR_RESPONSE'
          }
        });

        return EMPTY;
      }),
      finalize(() => {
        if (showSpinner === true) {
          void this.spinner.hide(APP_SPINNER_NAME);
        }
      })
    );

    return response;
  }

  /** Handled UI request that emits only successful output. */
  reqOutput<TRoute extends ToBackendRoute>(item: {
    route: TRoute;
    payload: ToBackendInputForRoute<NoInfer<TRoute>>;
    showSpinner?: boolean;
    onFailure?: (
      failure: ApiRequestFailure<ToBackendResponseForRoute<NoInfer<TRoute>>>
    ) => ApiFailureDecision | Promise<ApiFailureDecision>;
  }): Observable<ToBackendOutputForRoute<TRoute>> {
    let { route, payload, showSpinner, onFailure } = item;

    let output: Observable<ToBackendOutputForRoute<TRoute>> = this.reqResult({
      route: route,
      payload: payload,
      showSpinner: showSpinner,
      onFailure: onFailure
    }).pipe(
      concatMap(result => {
        if (Result.isFailure(result)) {
          return EMPTY;
        }

        let output: Observable<ToBackendOutputForRoute<TRoute>> = of(
          result.value
        );

        return output;
      })
    );

    return output;
  }

  /** Handled UI request that preserves both success and failure Results. */
  reqResult<TRoute extends ToBackendRoute>(item: {
    route: TRoute;
    payload: ToBackendInputForRoute<NoInfer<TRoute>>;
    showSpinner?: boolean;
    onFailure?: (
      failure: ApiRequestFailure<ToBackendResponseForRoute<NoInfer<TRoute>>>
    ) => ApiFailureDecision | Promise<ApiFailureDecision>;
  }): Observable<ApiRequestResult<TRoute>> {
    let { route, payload, showSpinner, onFailure } = item;

    let response: Observable<ApiRequestResult<TRoute>> = this.reqRawResult({
      route: route,
      payload: payload,
      showSpinner: showSpinner
    }).pipe(
      this.handle<
        ToBackendOutputForRoute<TRoute>,
        ApiRequestFailure<ToBackendResponseForRoute<TRoute>>
      >({
        onFailure: onFailure
      })
    );

    return response;
  }

  private handle<
    TOutput,
    TFailure extends ApiRequestFailure<ToBackendResponse>
  >(
    item: {
      onFailure?: (
        failure: TFailure
      ) => ApiFailureDecision | Promise<ApiFailureDecision>;
    } = {}
  ): MonoTypeOperatorFunction<Result.Result<TOutput, TFailure>> {
    let { onFailure } = item;

    let handler: MonoTypeOperatorFunction<Result.Result<TOutput, TFailure>> =
      concatMap(result => {
        if (Result.isFailure(result)) {
          if (
            result.error.type === 'backend' &&
            (result.error.response.error.code === 'BACKEND_UNAUTHORIZED' ||
              result.error.response.error.code === 'BACKEND_NOT_AUTHORIZED' ||
              result.error.response.error.code ===
                'BACKEND_USER_DOES_NOT_EXIST')
          ) {
            this.authService.logout();
          }

          let decision: Observable<ApiFailureDecision> = defer(() => {
            let localDecision:
              | ApiFailureDecision
              | Promise<ApiFailureDecision> = onFailure
              ? onFailure(result.error)
              : 'use-default';

            let decision: Observable<ApiFailureDecision> =
              typeof localDecision === 'string'
                ? of(localDecision)
                : from(localDecision);

            return decision;
          });

          // Cancellation suppresses default presentation after an async override.
          let handled: Observable<Result.Result<TOutput, TFailure>> =
            decision.pipe(
              map(decision => {
                if (decision === 'use-default') {
                  this.presentError<ToBackendResponse>({
                    failure: result.error
                  });
                }

                return result;
              })
            );

          return handled;
        }

        let success: Observable<Result.Result<TOutput, TFailure>> = of(result);

        return success;
      });

    return handler;
  }

  /** Presentation-free request API for intermediate services. */
  reqRawResult<TRoute extends ToBackendRoute>(item: {
    route: TRoute;
    payload: ToBackendInputForRoute<NoInfer<TRoute>>;
    showSpinner?: boolean;
  }): Observable<ApiRequestResult<TRoute>> {
    let { route, payload, showSpinner } = item;

    let response: Observable<ApiRequestResult<TRoute>> = defer(() => {
      let url: string = `${environment.httpUrl}/${route}`;

      let body: ToBackendRequest = makeToBackendRequest({
        route: route,
        traceId: makeId(),
        idempotencyKey: makeId(),
        input: payload
      });

      let headers: HttpHeaders = this.headers({ route: route });

      if (showSpinner === true) {
        void this.spinner.show(APP_SPINNER_NAME);
      }

      // HTTP response types are trusted backend contracts, not runtime validation.
      // Catch only HTTP execution errors, before response mapping or consumer code.
      let execution: Observable<
        | HttpResponse<ApiResponse<ToBackendResponseForRoute<TRoute>>>
        | HttpErrorResponse
        | TimeoutError
      > = this.authHttpClient
        .request<ApiResponse<ToBackendResponseForRoute<TRoute>>>('post', url, {
          headers: headers,
          body: body,
          observe: 'response'
        })
        .pipe(
          catchError((error: unknown) =>
            error instanceof HttpErrorResponse || error instanceof TimeoutError
              ? of(error)
              : throwError(() => error)
          )
        );

      let result: Observable<ApiRequestResult<TRoute>> = combineLatest([
        timer(showSpinner === true ? MIN_TIME_TO_SPIN : 0),
        execution
      ]).pipe(
        map(([, res]): ApiRequestResult<TRoute> => {
          let context: ApiRequestContext = {
            url: url,
            operation: body.operation,
            traceId: body.traceId,
            status: res instanceof TimeoutError ? undefined : res.status,
            response:
              res instanceof TimeoutError
                ? undefined
                : { statusText: res.statusText }
          };

          if (res instanceof TimeoutError) {
            return Result.fail({
              type: 'transport',
              error: { code: 'FRONT_REQUEST_TIMEOUT' },
              context: context
            });
          }

          // Angular's HTTP error body is trusted to use the same route contract.
          let apiResponse: ApiResponse<ToBackendResponseForRoute<TRoute>> =
            res instanceof HttpErrorResponse ? res.error : res.body;

          if (apiResponse) {
            context.response = {
              operation: apiResponse.operation,
              method: apiResponse.method,
              duration: apiResponse.duration,
              traceId: apiResponse.traceId,
              mproveVersion: apiResponse.mproveVersion
            };

            if (apiResponse.type === 'Failure') {
              return Result.fail({
                type: 'backend',
                response: apiResponse,
                context: context
              });
            }

            if (
              !(res instanceof HttpErrorResponse) &&
              res.status >= 200 &&
              res.status < 300 &&
              apiResponse.type === 'Success'
            ) {
              return Result.succeed(apiResponse.output);
            }
          }

          if (res instanceof HttpErrorResponse && res.status === 0) {
            return Result.fail({
              type: 'transport',
              error: { code: 'FRONT_REQUEST_FAILED' },
              context: context
            });
          }

          return Result.fail({
            type: 'invalid-response',
            error: { code: 'FRONT_INVALID_BACKEND_RESPONSE' },
            context: context
          });
        }),
        finalize(() => {
          if (showSpinner === true) {
            void this.spinner.hide(APP_SPINNER_NAME);
          }
        })
      );

      return result;
    });

    return response;
  }

  presentError<TResponse extends ToBackendResponse>(
    item:
      | { failure: ApiRequestFailure<TResponse> }
      | { errorData: ErrorData; response?: ToBackendResponse }
  ): void {
    let errorData: ErrorData;

    let response: ToBackendResponse;

    if ('failure' in item) {
      let { failure } = item;

      errorData = {
        reqUrl: failure.context.url,
        response: failure.context.response,
        message:
          failure.type === 'backend'
            ? 'FRONT_RESPONSE_INFO_STATUS_IS_NOT_OK'
            : failure.type === 'transport'
              ? failure.error.code === 'FRONT_REQUEST_TIMEOUT'
                ? 'FRONT_INSTANCE_OF_TIMEOUT_ERROR'
                : 'FRONT_INSTANCE_OF_HTTP_ERROR_RESPONSE'
              : 'FRONT_API_UNKNOWN_ERROR'
      };

      if (failure.type === 'backend') {
        response = failure.response;
        errorData.response = {
          body: failure.response,
          status: failure.context.status
        };
        errorData.originalError = new BackendResponseError({
          response: failure.response
        });
      }
    } else {
      let { errorData: legacyErrorData, response: legacyResponse } = item;

      errorData = legacyErrorData;
      response = legacyResponse;
    }

    if (response?.type !== 'Failure') {
      this.myDialogService.showError({ errorData: errorData, isThrow: false });

      return;
    }

    if (errorData.message !== 'FRONT_RESPONSE_INFO_STATUS_IS_NOT_OK') {
      if (isDefined(errorData.message)) {
        this.myDialogService.showError({
          errorData: errorData,
          isThrow: false
        });
      }

      return;
    }

    let error = response.error;

    let nav: NavState = this.navQuery.getValue();

    let orgProjectPath: string = `/${PATH_ORG}/${nav.orgId}/${PATH_PROJECT}/${nav.projectId}/${PATH_REPO}/${nav.repoId}`;

    if (
      error.code === 'BACKEND_ERROR_RESPONSE_FROM_DISK' &&
      error.originalError?.code === 'DISK_REPO_IS_NOT_CLEAN_FOR_CHECKOUT_BRANCH'
    ) {
      let currentBranch: string =
        error.originalError.displayData?.currentBranch;

      if (isDefined(currentBranch)) {
        setTimeout(() => {
          let currentNav: NavState = this.navQuery.getValue();

          let start: string[] = [
            PATH_ORG,
            currentNav.orgId,
            PATH_PROJECT,
            currentNav.projectId,
            PATH_REPO,
            currentNav.repoId
          ];

          void this.router
            .navigateByUrl(start.join('/'), { skipLocationChange: true })
            .then(() => {
              void this.router.navigate(
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

          this.myDialogService.showError({
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
      this.uiQuery.getValue().gridApi?.deselectAll();

      this.navigate({ path: orgProjectPath, target: 'reports', nav: nav });

      return;
    }

    if (
      error.code === 'BACKEND_MODEL_DOES_NOT_EXIST' ||
      error.code === 'BACKEND_CHART_DOES_NOT_EXIST'
    ) {
      this.navigate({ path: orgProjectPath, target: 'models', nav: nav });

      return;
    }

    if (error.code === 'BACKEND_DASHBOARD_DOES_NOT_EXIST') {
      this.navigate({ path: orgProjectPath, target: 'dashboards', nav: nav });

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
        this.navigate({ path: orgProjectPath, target: target, nav: nav });
    } else if (error.code === 'BACKEND_FORBIDDEN_REPO_ID') {
      errorData.message = 'Session is not found';
      errorData.leftButtonText = 'Ok';
      errorData.leftOnClickFnBindThis = () =>
        this.navigate({ path: orgProjectPath, target: 'session', nav: nav });
    } else if (
      error.code === 'BACKEND_MCONFIG_DOES_NOT_EXIST' ||
      error.code === 'BACKEND_QUERY_DOES_NOT_EXIST' ||
      error.code === 'BACKEND_STRUCT_ID_CHANGED' ||
      error.code === 'BACKEND_STRUCT_DOES_NOT_EXIST'
    ) {
      errorData.description = 'Reload to get changes';
      errorData.leftButtonText = 'Reload';
      errorData.leftOnClickFnBindThis = () =>
        this.navigate({ path: orgProjectPath, target: 'models', nav: nav });
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
        void this.router
          .navigateByUrl(orgProjectPath, { skipLocationChange: true })
          .then(() => {
            let encodedFileId: string = error.displayData?.encodedFileId;

            if (isDefined(encodedFileId)) {
              this.navigateService.navigateToFileLine({
                builderLeft: 'Tree',
                encodedFileId: encodedFileId
              });
            } else {
              this.navigateService.navigateToBuilder({
                branchId: nav.branchId
              });
            }
          });
      };
    }

    this.myDialogService.showError({ errorData: errorData, isThrow: false });
  }

  private navigate(item: {
    path: string;
    target: ApiNavigationTarget;
    nav: NavState;
  }): void {
    let { path, target, nav } = item;

    void this.router
      .navigateByUrl(path, { skipLocationChange: true })
      .then(() => {
        if (target === 'reports') {
          this.navigateService.navigateToReports();
        } else if (target === 'models') {
          this.navigateService.navigateToModels();
        } else if (target === 'dashboards') {
          this.navigateService.navigateToDashboards();
        } else {
          void this.router.navigate([
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

  private mapLegacyResponse<TResponse extends ToBackendResponse>(item: {
    res: HttpResponse<ApiResponse<TResponse>>;
    url: string;
    body: ToBackendRequest;
  }): TResponse {
    let { res, url, body } = item;

    let requestInput: unknown = body.input;

    let errorData: ErrorData = {
      reqUrl: url,
      reqBody:
        typeof requestInput === 'object' &&
        requestInput !== null &&
        'password' in requestInput
          ? Object.assign({}, body, {
              input: Object.assign({}, requestInput, { password: undefined })
            })
          : body,
      response: Object.assign({}, res, { headers: undefined }),
      message: isUndefined(res.body)
        ? 'FRONT_RESPONSE_BODY_IS_EMPTY'
        : res.status !== 201
          ? 'FRONT_RESPONSE_CODE_IS_NOT_201'
          : res.body.type !== 'Success'
            ? 'FRONT_RESPONSE_INFO_STATUS_IS_NOT_OK'
            : undefined,
      description: isUndefined(res.body)
        ? 'The API returned an empty response body.'
        : undefined
    };

    if (isDefined(errorData.message)) {
      if (res.body?.type === 'Failure') {
        errorData.originalError = new BackendResponseError({
          response: res.body
        });

        if (
          errorData.message === 'FRONT_RESPONSE_INFO_STATUS_IS_NOT_OK' &&
          (res.body.error.code === 'BACKEND_UNAUTHORIZED' ||
            res.body.error.code === 'BACKEND_NOT_AUTHORIZED' ||
            res.body.error.code === 'BACKEND_USER_DOES_NOT_EXIST')
        ) {
          this.authService.logout();
        }

        this.presentError({
          errorData: errorData,
          response: res.body
        });

        let response: TResponse = res.body;

        return response;
      }

      this.presentError({ errorData: errorData });

      throw new Error(SPECIAL_ERROR);
    }

    let response: TResponse = res.body;

    return response;
  }

  resolveReportsRoute(item: { showSpinner: boolean }): Observable<boolean> {
    let { showSpinner } = item;

    let nav: NavState = this.navQuery.getValue();

    let response: Observable<boolean> = this.req({
      route: 'api/ToBackendGetReports',
      payload: {
        projectId: nav.projectId,
        repoId: nav.repoId,
        branchId: nav.branchId,
        envId: nav.envId
      },
      showSpinner: showSpinner
    }).pipe(
      map(resp => {
        if (resp.type === 'Success') {
          this.memberQuery.update(resp.output.userMember);

          this.structQuery.update(resp.output.struct);

          this.navQuery.updatePart({ needValidate: resp.output.needValidate });

          this.reportsQuery.update({
            reportUnitDrafts: resp.output.reportUnitDrafts,
            reportSpaceNodes: resp.output.reportSpaceNodes
          });

          this.modelsQuery.update({ models: resp.output.storeModels });

          this.uiQuery.updatePart({ metricsLoadedTs: Date.now() });

          return true;
        }

        if (resp.error.code === 'BACKEND_BRANCH_DOES_NOT_EXIST') {
          void this.router.navigate([
            PATH_ORG,
            nav.orgId,
            PATH_PROJECT,
            nav.projectId,
            PATH_INFO
          ]);
        }

        return false;
      })
    );

    return response;
  }
}
