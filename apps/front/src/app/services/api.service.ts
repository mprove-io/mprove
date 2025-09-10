import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { EMPTY, Observable, TimeoutError, combineLatest, timer } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';
import {
  LAST_SELECTED_CHART_ID,
  LAST_SELECTED_FILE_ID,
  LAST_SELECTED_MODEL_ID,
  PATH_BRANCH,
  PATH_ENV,
  PATH_FILE,
  PATH_FILES,
  PATH_INFO,
  PATH_ORG,
  PATH_PROJECT,
  PATH_REPO,
  PROD_REPO_ID
} from '~common/constants/top';
import {
  APP_SPINNER_NAME,
  LOCAL_STORAGE_TOKEN,
  MIN_TIME_TO_SPIN,
  SPECIAL_ERROR
} from '~common/constants/top-front';
import { ErEnum } from '~common/enums/er.enum';
import { PanelEnum } from '~common/enums/panel.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { makeId } from '~common/functions/make-id';
import { ErrorData } from '~common/interfaces/front/error-data';
import {
  ToBackendGetReportsRequestPayload,
  ToBackendGetReportsResponse
} from '~common/interfaces/to-backend/reports/to-backend-get-reports';
import { ToBackendRequest } from '~common/interfaces/to-backend/to-backend-request';
import { environment } from '~front/environments/environment';
import { MemberQuery } from '../queries/member.query';
import { ModelQuery } from '../queries/model.query';
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
    private modelQuery: ModelQuery,
    private myDialogService: MyDialogService,
    private navigateService: NavigateService,
    private reportsQuery: ReportsQuery,
    private modelsQuery: ModelsQuery,
    private structQuery: StructQuery,
    private memberQuery: MemberQuery
  ) {}

  req(item: {
    pathInfoName: ToBackendRequestInfoNameEnum;
    payload: any;
    showSpinner?: boolean;
  }): Observable<any> {
    let { pathInfoName, payload, showSpinner } = item;

    let bypassAuth = [
      ToBackendRequestInfoNameEnum.ToBackendLoginUser
      // api.PATH_REGISTER_USER,
      // api.PATH_VERIFY_USER_EMAIL,
      // api.PATH_CONFIRM_USER_EMAIL,
      // api.PATH_LOGIN_USER,
      // api.PATH_RESET_USER_PASSWORD,
      // api.PATH_UPDATE_USER_PASSWORD
    ];

    let headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization:
        bypassAuth.indexOf(pathInfoName) < 0
          ? `Bearer ${localStorage.getItem(LOCAL_STORAGE_TOKEN)}`
          : ''
    });

    let url =
      environment.httpUrl +
      '/' +
      // + commonAPI_PATH + '/'
      pathInfoName;

    let body: ToBackendRequest = {
      info: {
        traceId: makeId(),
        name: pathInfoName,
        idempotencyKey: makeId()
      },
      payload: payload
    };

    let options = {
      headers: headers,
      body: body, // https://github.com/angular/angular/issues/10612
      observe: <any>'response'
      // responseType: 'json',
    };

    if (showSpinner === true) {
      this.spinner.show(APP_SPINNER_NAME);
    }

    return combineLatest([
      timer(showSpinner === true ? MIN_TIME_TO_SPIN : 0),
      this.authHttpClient.request('post', url, options)
    ]).pipe(
      map(x =>
        this.mapRes({
          pathInfoName: pathInfoName,
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
  }

  private mapRes(item: {
    pathInfoName: ToBackendRequestInfoNameEnum;
    res: any;
    req: {
      url: string;
      headers: any;
      body: any;
    };
  }) {
    let { res, req, pathInfoName } = item;

    let nav = this.navQuery.getValue();
    let userId = this.userQuery.getValue().userId;
    let repoId = nav.isRepoProd === true ? PROD_REPO_ID : userId;

    let orgProjectPath = `/${PATH_ORG}/${nav.orgId}/${PATH_PROJECT}/${nav.projectId}/${PATH_REPO}/${repoId}`;

    let errorData: ErrorData = {
      reqUrl: req.url,
      // reqHeaders: req.headers,
      reqBody: isDefined(req.body?.payload?.password)
        ? Object.assign({}, req.body, {
            payload: Object.assign({}, req.body.payload, {
              password: undefined
            })
          })
        : req.body,
      response: res,
      message:
        res.status !== 201
          ? ErEnum.FRONT_RESPONSE_CODE_IS_NOT_201
          : res.body?.info?.status !== ResponseInfoStatusEnum.Ok
            ? ErEnum.FRONT_RESPONSE_INFO_STATUS_IS_NOT_OK
            : undefined
    };

    let infoErrorMessage = res?.body?.info?.error?.message;

    if (
      isDefined(errorData.message) &&
      errorData.message === ErEnum.FRONT_RESPONSE_INFO_STATUS_IS_NOT_OK
    ) {
      if (
        [
          ErEnum.BACKEND_UNAUTHORIZED,
          ErEnum.BACKEND_NOT_AUTHORIZED,
          ErEnum.BACKEND_USER_DOES_NOT_EXIST
        ].indexOf(infoErrorMessage) > -1
      ) {
        this.authService.logout();
      }

      if (
        infoErrorMessage === ErEnum.BACKEND_ERROR_RESPONSE_FROM_DISK &&
        errorData.response.body.info.error.originalError?.message ===
          ErEnum.DISK_REPO_IS_NOT_CLEAN_FOR_CHECKOUT_BRANCH
      ) {
        setTimeout(() => {
          let nav = this.navQuery.getValue();

          let repoId =
            nav.isRepoProd === true
              ? PROD_REPO_ID
              : this.userQuery.getValue().userId;

          let arStart = [
            PATH_ORG,
            nav.orgId,
            PATH_PROJECT,
            nav.projectId,
            PATH_REPO,
            repoId
          ];

          let arStartStr = arStart.join('/');

          let arNext = [
            ...arStart,
            PATH_BRANCH,
            errorData.response.body.info.error.originalError.data.currentBranch,
            PATH_ENV,
            nav.envId,
            PATH_FILES,
            PATH_FILE,
            LAST_SELECTED_FILE_ID
          ];

          this.router
            .navigateByUrl(arStartStr, { skipLocationChange: true })
            .then(() => {
              this.router.navigate(arNext, {
                queryParams: {
                  panel: PanelEnum.Tree
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
      } else if (
        [ErEnum.BACKEND_FORBIDDEN_DASHBOARD].indexOf(infoErrorMessage) > -1
      ) {
        errorData.description = `Check dashboard access rules`;
        errorData.buttonText = 'Ok, go to dashboards';
        errorData.onClickFnBindThis = (() => {
          this.router
            .navigateByUrl(orgProjectPath, { skipLocationChange: true })
            .then(() => {
              this.navigateService.navigateToDashboards();
            });
        }).bind(this);

        this.myDialogService.showError({ errorData, isThrow: false });
      } else if (
        [ErEnum.BACKEND_FORBIDDEN_MODEL].indexOf(infoErrorMessage) > -1
      ) {
        errorData.description = `Check model access rules`;
        errorData.buttonText = 'Ok, go to charts';
        errorData.onClickFnBindThis = (() => {
          this.router
            .navigateByUrl(orgProjectPath, { skipLocationChange: true })
            .then(() => {
              // this.navigateService.navigateToModels();
              this.navigateService.navigateToChart({
                modelId: LAST_SELECTED_MODEL_ID,
                chartId: LAST_SELECTED_CHART_ID
              });
            });
        }).bind(this);

        this.myDialogService.showError({ errorData, isThrow: false });
      } else if (
        [
          ErEnum.BACKEND_MCONFIG_DOES_NOT_EXIST,
          ErEnum.BACKEND_MODEL_DOES_NOT_EXIST,
          ErEnum.BACKEND_CHART_DOES_NOT_EXIST,
          ErEnum.BACKEND_DASHBOARD_DOES_NOT_EXIST,
          ErEnum.BACKEND_STRUCT_ID_CHANGED,
          ErEnum.BACKEND_STRUCT_DOES_NOT_EXIST,
          ErEnum.BACKEND_QUERY_DOES_NOT_EXIST,
          ErEnum.BACKEND_REPORT_DOES_NOT_EXIST,
          ErEnum.BACKEND_REPORT_NOT_FOUND
        ].indexOf(infoErrorMessage) > -1
      ) {
        errorData.description = `This typically happens if a user with the editor role has recently made new changes to files in the current branch.`;
        errorData.buttonText = 'Ok, get changes';
        errorData.onClickFnBindThis = (() => {
          if (
            [
              ErEnum.BACKEND_REPORT_DOES_NOT_EXIST,
              ErEnum.BACKEND_REPORT_NOT_FOUND
            ].indexOf(infoErrorMessage) > -1
          ) {
            let uiState = this.uiQuery.getValue();

            if (isDefined(uiState.gridApi)) {
              uiState.gridApi.deselectAll();
            }

            // this.resolveReportsRoute({
            //   showSpinner: true
            // })
            //   .pipe(
            //     tap(x => {
            //       this.navigateService.navigateToReports();
            //     }),
            //     take(1)
            //   )
            //   .subscribe();

            this.router
              .navigateByUrl(orgProjectPath, { skipLocationChange: true })
              .then(() => {
                this.navigateService.navigateToReports();
              });
          } else if (
            [ErEnum.BACKEND_MODEL_DOES_NOT_EXIST].indexOf(infoErrorMessage) > -1
          ) {
            this.router
              .navigateByUrl(orgProjectPath, { skipLocationChange: true })
              .then(() => {
                // this.navigateService.navigateToModels();
                this.navigateService.navigateToChart({
                  modelId: LAST_SELECTED_MODEL_ID,
                  chartId: LAST_SELECTED_CHART_ID
                });
              });
          } else if (
            [ErEnum.BACKEND_DASHBOARD_DOES_NOT_EXIST].indexOf(
              infoErrorMessage
            ) > -1
          ) {
            this.router
              .navigateByUrl(orgProjectPath, { skipLocationChange: true })
              .then(() => {
                this.navigateService.navigateToDashboards();
              });
          } else if (
            [ErEnum.BACKEND_CHART_DOES_NOT_EXIST].indexOf(infoErrorMessage) > -1
          ) {
            this.router
              .navigateByUrl(orgProjectPath, { skipLocationChange: true })
              .then(() => {
                // this.navigateService.navigateToModels();
                this.navigateService.navigateToChart({
                  modelId: LAST_SELECTED_MODEL_ID,
                  chartId: LAST_SELECTED_CHART_ID
                });
              });
          } else if (
            [
              ErEnum.BACKEND_MCONFIG_DOES_NOT_EXIST,
              ErEnum.BACKEND_QUERY_DOES_NOT_EXIST
            ].indexOf(infoErrorMessage) > -1
          ) {
            let model = this.modelQuery.getValue();

            if (isDefined(model.modelId)) {
              this.router
                .navigateByUrl(orgProjectPath, { skipLocationChange: true })
                .then(() => {
                  // this.navigateService.navigateToChart({
                  //   modelId: model.modelId,
                  //   chartId: EMPTY_CHART_ID
                  // });
                  this.navigateService.navigateToChart({
                    modelId: LAST_SELECTED_MODEL_ID,
                    chartId: LAST_SELECTED_CHART_ID
                  });
                });
            } else {
              this.router
                .navigateByUrl(orgProjectPath, { skipLocationChange: true })
                .then(() => {
                  // this.navigateService.navigateToModels();
                  this.navigateService.navigateToChart({
                    modelId: LAST_SELECTED_MODEL_ID,
                    chartId: LAST_SELECTED_CHART_ID
                  });
                });
            }
          } else {
            this.router
              .navigateByUrl(orgProjectPath, { skipLocationChange: true })
              .then(() => {
                // this.navigateService.navigateToModels();
                this.navigateService.navigateToChart({
                  modelId: LAST_SELECTED_MODEL_ID,
                  chartId: LAST_SELECTED_CHART_ID
                });
              });
          }
        }).bind(this);

        this.myDialogService.showError({ errorData, isThrow: false });
      } else if (infoErrorMessage === ErEnum.BACKEND_RESTRICTED_USER) {
        errorData.description = `This user is restricted for Demo purposes. Sign Up at https://mprove.io to get full access.`;
        this.myDialogService.showError({ errorData, isThrow: false });
      } else if (
        infoErrorMessage === ErEnum.BACKEND_RESTRICTED_PROJECT &&
        pathInfoName === ToBackendRequestInfoNameEnum.ToBackendPushRepo
      ) {
        errorData.description = `Some actions of this project is restricted for Demo purposes. Switch organization/project to remove restrictions and be able to push to remote.`;
        this.myDialogService.showError({ errorData, isThrow: false });
      } else if (
        infoErrorMessage === ErEnum.BACKEND_RESTRICTED_PROJECT &&
        pathInfoName !== ToBackendRequestInfoNameEnum.ToBackendPushRepo
      ) {
        errorData.description = `Some actions of this project is restricted for Demo purposes. Switch organization/project to remove restrictions.`;
        this.myDialogService.showError({ errorData, isThrow: false });
      } else if (
        [
          ErEnum.BACKEND_CREATE_DASHBOARD_FAIL,
          ErEnum.BACKEND_MODIFY_DASHBOARD_FAIL,
          ErEnum.BACKEND_CREATE_CHART_FAIL,
          ErEnum.BACKEND_MODIFY_CHART_FAIL,
          ErEnum.BACKEND_CREATE_REPORT_FAIL,
          ErEnum.BACKEND_MODIFY_REPORT_FAIL
        ].indexOf(infoErrorMessage) > -1
      ) {
        errorData.description = `The changes were saved to the file, but it failed the validation. It's probably a bug.`;
        errorData.buttonText = 'Ok, go to file';
        errorData.onClickFnBindThis = (() => {
          this.router
            .navigateByUrl(orgProjectPath, { skipLocationChange: true })
            .then(() => {
              this.navigateService.navigateToFileLine({
                panel: PanelEnum.Tree,
                encodedFileId:
                  errorData.response.body.info.error.data.encodedFileId
              });
            });
        }).bind(this);

        this.myDialogService.showError({ errorData, isThrow: false });
      } else {
        this.myDialogService.showError({ errorData, isThrow: false });
      }

      return { errorData: errorData };
    } else if (
      isDefined(errorData.message) &&
      errorData.message !== ErEnum.FRONT_RESPONSE_INFO_STATUS_IS_NOT_OK
    ) {
      this.myDialogService.showError({ errorData, isThrow: true });

      return { errorData: errorData };
    }

    return res.body;
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

    let payload: ToBackendGetReportsRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId
    };

    return this.req({
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetReports,
      payload: payload,
      showSpinner: showSpinner
    }).pipe(
      map((resp: ToBackendGetReportsResponse) => {
        if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
          this.memberQuery.update(resp.payload.userMember);

          this.structQuery.update(resp.payload.struct);

          this.navQuery.updatePart({
            needValidate: resp.payload.needValidate
          });

          this.reportsQuery.update({
            reports: resp.payload.reports
          });

          this.modelsQuery.update({ models: resp.payload.storeModels });

          this.uiQuery.updatePart({ metricsLoadedTs: Date.now() });

          return true;
        } else if (
          resp.info?.status === ResponseInfoStatusEnum.Error &&
          resp.info.error.message === ErEnum.BACKEND_BRANCH_DOES_NOT_EXIST
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
