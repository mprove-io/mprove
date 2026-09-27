import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  type HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { combineLatest, EMPTY, Observable, TimeoutError, timer } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';
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
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { ErEnum } from '#common/enums/er.enum';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { makeId } from '#common/functions/make-id/make-id';
import { unwrapToBackendResponse } from '#common/functions/unwrap-to-backend-response/unwrap-to-backend-response';
import type { ToBackendInputForRoute } from '#common/types/to-backend-input-for-route';
import type { ToBackendRoute } from '#common/types/to-backend-route';
import type { ToBackendRequest } from '#common/zod/backend/request/to-backend-request';
import type { ToBackendResponse } from '#common/zod/backend/response/to-backend-response';
import type { ToBackendResponseForRoute } from '#common/zod/backend/response/to-backend-response-for-route';
import type { ToBackendGetReportsInput } from '#common/zod/backend/routes/reports/get-reports/get-reports-request';
import type { ToBackendGetReportsResponse } from '#common/zod/backend/routes/reports/get-reports/get-reports-response';
import type { ErrorData } from '#common/zod/front/error-data';
import { environment } from '#front/environments/environment';
import { MemberQuery } from '../queries/member.query';
import { ModelsQuery } from '../queries/models.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { ReportsQuery } from '../queries/reports.query';
import { StructQuery } from '../queries/struct.query';
import { UiQuery } from '../queries/ui.query';
import { UserQuery } from '../queries/user.query';
import { AuthService } from './auth.service';
import { MyDialogService } from './my-dialog.service';
import { NavigateService } from './navigate.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(
    private router: Router,
    private navQuery: NavQuery,
    private userQuery: UserQuery,
    private authHttpClient: HttpClient,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private uiQuery: UiQuery,
    private myDialogService: MyDialogService,
    private navigateService: NavigateService,
    private reportsQuery: ReportsQuery,
    private modelsQuery: ModelsQuery,
    private structQuery: StructQuery,
    private memberQuery: MemberQuery
  ) {}

  req<TRoute extends ToBackendRoute>(item: {
    route: TRoute;
    payload: ToBackendInputForRoute<NoInfer<TRoute>>;
    showSpinner?: boolean;
  }): Observable<ToBackendResponseForRoute<TRoute>> {
    let { route, payload, showSpinner } = item;

    let bypassAuth: string[] = ['api/ToBackendLoginUser'];

    let headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization:
        bypassAuth.indexOf(route) < 0
          ? `Bearer ${localStorage.getItem(LOCAL_STORAGE_TOKEN)}`
          : ''
    });

    let url: string = environment.httpUrl + '/' + route;

    let body: ToBackendRequest = {
      traceId: makeId(),
      idempotencyKey: makeId(),
      input: payload
    };

    if (showSpinner === true) {
      this.spinner.show(APP_SPINNER_NAME);
    }

    let response: Observable<ToBackendResponseForRoute<TRoute>> = combineLatest(
      [
        timer(showSpinner === true ? MIN_TIME_TO_SPIN : 0),
        this.authHttpClient.request<ToBackendResponseForRoute<TRoute>>(
          'post',
          url,
          {
            headers: headers,
            body: body,
            observe: 'response'
          }
        )
      ]
    ).pipe(
      map(x =>
        this.mapRes({
          res: x[1],
          req: {
            url: url,
            headers: headers,
            body: body
          }
        })
      ),
      catchError(e => this.catchErr(e)),
      finalize(() => {
        if (showSpinner === true) {
          this.spinner.hide(APP_SPINNER_NAME);
        }
      })
    );

    return response;
  }

  private mapRes<TResponse extends ToBackendResponse>(item: {
    res: HttpResponse<TResponse>;
    req: {
      url: string;
      headers: HttpHeaders;
      body: ToBackendRequest;
    };
  }): TResponse {
    let { res, req } = item;

    let requestInput: unknown = req.body.input;

    let nav = this.navQuery.getValue();

    let orgProjectPath = `/${PATH_ORG}/${nav.orgId}/${PATH_PROJECT}/${nav.projectId}/${PATH_REPO}/${nav.repoId}`;

    let errorData: ErrorData = {
      reqUrl: req.url,
      reqBody:
        typeof requestInput === 'object' &&
        requestInput !== null &&
        'password' in requestInput
          ? Object.assign({}, req.body, {
              input: Object.assign({}, requestInput, {
                password: undefined
              })
            })
          : req.body,
      response: Object.assign({}, res, { headers: undefined }),
      message:
        res.status !== 201
          ? ErEnum.FRONT_RESPONSE_CODE_IS_NOT_201
          : res.body?.result?.type !== 'Success'
            ? ErEnum.FRONT_RESPONSE_INFO_STATUS_IS_NOT_OK
            : undefined
    };

    let infoErrorMessage: string =
      res.body?.result?.type === 'Failure'
        ? res.body.result.error.message
        : undefined;

    if (
      isDefined(errorData.message) &&
      errorData.message === ErEnum.FRONT_RESPONSE_INFO_STATUS_IS_NOT_OK
    ) {
      if (
        [
          ErEnum.BACKEND_UNAUTHORIZED,
          ErEnum.BACKEND_NOT_AUTHORIZED,
          ErEnum.BACKEND_USER_DOES_NOT_EXIST
        ].some(message => message === infoErrorMessage)
      ) {
        this.authService.logout();
      }

      if (
        infoErrorMessage === ErEnum.BACKEND_ERROR_RESPONSE_FROM_DISK &&
        errorData.response.body.result.error.originalError?.message ===
          'DISK_REPO_IS_NOT_CLEAN_FOR_CHECKOUT_BRANCH'
      ) {
        let errorCurrentBranch =
          errorData.response.body?.result?.error?.originalError?.displayData
            ?.currentBranch;

        if (isDefined(errorCurrentBranch)) {
          setTimeout(() => {
            let nav = this.navQuery.getValue();

            let arStart = [
              PATH_ORG,
              nav.orgId,
              PATH_PROJECT,
              nav.projectId,
              PATH_REPO,
              nav.repoId
            ];

            let arStartStr = arStart.join('/');

            let arNext = [
              ...arStart,
              PATH_BRANCH,
              errorCurrentBranch,
              PATH_ENV,
              nav.envId,
              PATH_BUILDER,
              PATH_NEW_SESSION
            ];

            this.router
              .navigateByUrl(arStartStr, { skipLocationChange: true })
              .then(() => {
                this.router.navigate(arNext, {
                  queryParams: {
                    left: BuilderLeftEnum.Tree
                  }
                });
              });

            this.myDialogService.showError({
              errorData: {
                message:
                  ErEnum.FRONT_CANNOT_SWITCH_BRANCH_WHILE_SELECTED_REPO_HAS_UNCOMMITTED_CHANGES
              },
              isThrow: false
            });
          }, 0);
        }
      } else if (infoErrorMessage === ErEnum.BACKEND_FORBIDDEN_DASHBOARD) {
        errorData.description = `Check dashboard access rules`;
        errorData.leftButtonText = 'Go to dashboards';
        errorData.leftOnClickFnBindThis = (() => {
          this.router
            .navigateByUrl(orgProjectPath, { skipLocationChange: true })
            .then(() => {
              this.navigateService.navigateToDashboards();
            });
        }).bind(this);

        this.myDialogService.showError({ errorData, isThrow: false });
      } else if (infoErrorMessage === ErEnum.BACKEND_FORBIDDEN_REPORT) {
        errorData.description = `Check report access rules`;
        errorData.leftButtonText = 'Go to reports';
        errorData.leftOnClickFnBindThis = (() => {
          this.router
            .navigateByUrl(orgProjectPath, { skipLocationChange: true })
            .then(() => {
              this.navigateService.navigateToReports();
            });
        }).bind(this);

        this.myDialogService.showError({ errorData, isThrow: false });
      } else if (infoErrorMessage === ErEnum.BACKEND_FORBIDDEN_MODEL) {
        errorData.description = `Check model access rules`;
        errorData.leftButtonText = 'Go to charts';
        errorData.leftOnClickFnBindThis = (() => {
          this.router
            .navigateByUrl(orgProjectPath, { skipLocationChange: true })
            .then(() => {
              this.navigateService.navigateToModels();
            });
        }).bind(this);

        this.myDialogService.showError({ errorData, isThrow: false });
      } else if (infoErrorMessage === ErEnum.BACKEND_FORBIDDEN_REPO_ID) {
        errorData.message = 'Session is not found';
        errorData.leftButtonText = 'Ok';
        errorData.leftOnClickFnBindThis = (() => {
          this.router
            .navigateByUrl(orgProjectPath, { skipLocationChange: true })
            .then(() => {
              this.router.navigate([
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
            });
        }).bind(this);

        this.myDialogService.showError({ errorData, isThrow: false });
      } else if (
        [
          ErEnum.BACKEND_REPORT_DOES_NOT_EXIST,
          ErEnum.BACKEND_REPORT_NOT_FOUND
        ].some(message => message === infoErrorMessage)
      ) {
        let uiState = this.uiQuery.getValue();

        if (isDefined(uiState.gridApi)) {
          uiState.gridApi.deselectAll();
        }
        // console.log(infoErrorMessage);
        this.router
          .navigateByUrl(orgProjectPath, { skipLocationChange: true })
          .then(() => {
            this.navigateService.navigateToReports();
          });
      } else if (infoErrorMessage === ErEnum.BACKEND_MODEL_DOES_NOT_EXIST) {
        // console.log(infoErrorMessage);
        this.router
          .navigateByUrl(orgProjectPath, { skipLocationChange: true })
          .then(() => {
            this.navigateService.navigateToModels();
          });
      } else if (infoErrorMessage === ErEnum.BACKEND_DASHBOARD_DOES_NOT_EXIST) {
        // console.log(infoErrorMessage);
        this.router
          .navigateByUrl(orgProjectPath, { skipLocationChange: true })
          .then(() => {
            this.navigateService.navigateToDashboards();
          });
      } else if (infoErrorMessage === ErEnum.BACKEND_CHART_DOES_NOT_EXIST) {
        // console.log(infoErrorMessage);
        this.router
          .navigateByUrl(orgProjectPath, { skipLocationChange: true })
          .then(() => {
            this.navigateService.navigateToModels();
          });
      } else if (
        [
          ErEnum.BACKEND_MCONFIG_DOES_NOT_EXIST,
          ErEnum.BACKEND_QUERY_DOES_NOT_EXIST,
          ErEnum.BACKEND_STRUCT_ID_CHANGED,
          ErEnum.BACKEND_STRUCT_DOES_NOT_EXIST
        ].some(message => message === infoErrorMessage)
      ) {
        errorData.description = `Reload to get changes`;
        errorData.leftButtonText = 'Reload';
        errorData.leftOnClickFnBindThis = (() => {
          this.router
            .navigateByUrl(orgProjectPath, { skipLocationChange: true })
            .then(() => {
              this.navigateService.navigateToModels();
            });
        }).bind(this);

        // errorData.rightButtonText = 'Get changes, go to builder';
        // errorData.rightOnClickFnBindThis = (() => {
        //   this.router
        //     .navigateByUrl(orgProjectPath, { skipLocationChange: true })
        //     .then(() => {
        //       this.navigateService.navigateToBuilder({
        //         branchId: nav.branchId
        //       });
        //     });
        // }).bind(this);

        this.myDialogService.showError({ errorData, isThrow: false });
      } else if (
        infoErrorMessage === ErEnum.BACKEND_CODEX_AUTH_SIGN_IN_REQUIRED
      ) {
        errorData.description = `Sign in to ChatGPT on user profile page to refresh auth`;
        this.myDialogService.showError({ errorData, isThrow: false });
      } else if (infoErrorMessage === ErEnum.BACKEND_RESTRICTED_USER) {
        errorData.description = `Demo user is restricted. Sign Up at https://mprove.io to create your own project.`;
        this.myDialogService.showError({ errorData, isThrow: false });
      } else if (infoErrorMessage === ErEnum.BACKEND_RESTRICTED_PROJECT) {
        errorData.description = `Some actions of Demo project are restricted. Switch organization project to remove restrictions.`;
        this.myDialogService.showError({ errorData, isThrow: false });
      } else if (infoErrorMessage === ErEnum.BACKEND_ROLES_DO_NOT_EXIST) {
        let missingRoles =
          errorData.response.body.result.error.displayData?.roles;

        let missingRolesText = Array.isArray(missingRoles)
          ? missingRoles.join(', ')
          : '';

        errorData.message =
          missingRolesText.length > 0
            ? `Roles do not exist: ${missingRolesText}`
            : 'Roles do not exist';

        this.myDialogService.showError({ errorData, isThrow: false });
      } else if (
        [
          ErEnum.BACKEND_CREATE_DASHBOARD_FAIL,
          ErEnum.BACKEND_MODIFY_DASHBOARD_FAIL,
          ErEnum.BACKEND_CREATE_CHART_FAIL,
          ErEnum.BACKEND_MODIFY_CHART_FAIL,
          ErEnum.BACKEND_CREATE_REPORT_FAIL,
          ErEnum.BACKEND_MODIFY_REPORT_FAIL
        ].some(message => message === infoErrorMessage)
      ) {
        errorData.description = `The changes were saved to the file, but it failed the validation. It's probably a bug.`;
        errorData.leftButtonText = 'Go to File';
        errorData.leftOnClickFnBindThis = (() => {
          this.router
            .navigateByUrl(orgProjectPath, { skipLocationChange: true })
            .then(() => {
              let encodedFileId =
                errorData?.response?.body?.result?.error?.displayData
                  ?.encodedFileId;

              if (isDefined(encodedFileId)) {
                this.navigateService.navigateToFileLine({
                  builderLeft: BuilderLeftEnum.Tree,
                  encodedFileId: encodedFileId
                });
              } else {
                this.navigateService.navigateToBuilder({
                  branchId: nav.branchId
                });
              }
            });
        }).bind(this);

        this.myDialogService.showError({ errorData, isThrow: false });
      } else {
        this.myDialogService.showError({ errorData, isThrow: false });
      }

      let response: TResponse = res.body;

      return response;
    } else if (
      isDefined(errorData.message) &&
      errorData.message !== ErEnum.FRONT_RESPONSE_INFO_STATUS_IS_NOT_OK
    ) {
      this.myDialogService.showError({ errorData, isThrow: true });

      throw new Error(SPECIAL_ERROR);
    }

    let response: TResponse = res.body;

    return response;
  }

  private navigateToLastModelChart(nav: NavState) {
    let uiState = this.uiQuery.getValue();

    let pModelLink = uiState.projectModelLinks.find(
      link => link.projectId === nav.projectId
    );
    let pChartLink = uiState.projectChartLinks.find(
      link => link.projectId === nav.projectId
    );

    if (isDefined(pModelLink) && isDefined(pChartLink)) {
      this.navigateService.navigateToChart({
        modelId: pModelLink.modelId,
        chartId: pChartLink.chartId
      });
    } else {
      this.navigateService.navigateToModels();
    }
  }

  private catchErr(e: any) {
    if (e.message === SPECIAL_ERROR) {
      return EMPTY;
    }

    let errorData: ErrorData = {
      originalError: e,
      message:
        e instanceof HttpErrorResponse
          ? ErEnum.FRONT_INSTANCE_OF_HTTP_ERROR_RESPONSE
          : e instanceof TimeoutError
            ? ErEnum.FRONT_INSTANCE_OF_TIMEOUT_ERROR
            : ErEnum.FRONT_API_UNKNOWN_ERROR
    };

    this.myDialogService.showError({ errorData, isThrow: false });

    return EMPTY;
  }

  resolveReportsRoute(item: { showSpinner: boolean }): Observable<boolean> {
    let { showSpinner } = item;

    let nav: NavState;
    this.navQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        nav = x;
      });

    let payload: ToBackendGetReportsInput = {
      projectId: nav.projectId,
      repoId: nav.repoId,
      branchId: nav.branchId,
      envId: nav.envId
    };

    return this.req({
      route: 'api/ToBackendGetReports',
      payload: payload,
      showSpinner: showSpinner
    }).pipe(
      map((resp: ToBackendGetReportsResponse) => {
        if (resp.result?.type === 'Success') {
          this.memberQuery.update(
            unwrapToBackendResponse({ response: resp }).userMember
          );

          this.structQuery.update(
            unwrapToBackendResponse({ response: resp }).struct
          );

          this.navQuery.updatePart({
            needValidate: unwrapToBackendResponse({ response: resp })
              .needValidate
          });

          this.reportsQuery.update({
            reportUnitDrafts: unwrapToBackendResponse({ response: resp })
              .reportUnitDrafts,
            reportSpaceNodes: unwrapToBackendResponse({ response: resp })
              .reportSpaceNodes
          });

          this.modelsQuery.update({
            models: unwrapToBackendResponse({ response: resp }).storeModels
          });

          this.uiQuery.updatePart({ metricsLoadedTs: Date.now() });

          return true;
        } else if (
          resp.result?.type === 'Failure' &&
          resp.result.error.message === ErEnum.BACKEND_BRANCH_DOES_NOT_EXIST
        ) {
          this.router.navigate([
            PATH_ORG,
            nav.orgId,
            PATH_PROJECT,
            nav.projectId,
            PATH_INFO
          ]);

          return false;
        } else {
          return false;
        }
      })
    );
  }
}
