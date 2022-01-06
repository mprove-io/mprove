import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { combineLatest, EMPTY, Observable, TimeoutError, timer } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { apiToDisk } from '~front/barrels/api-to-disk';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { enums } from '~front/barrels/enums';
import { interfaces } from '~front/barrels/interfaces';
import { environment } from '~front/environments/environment';
import { AuthService } from './auth.service';
import { MyDialogService } from './my-dialog.service';
import { NavigateService } from './navigate.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  showSpinner: apiToBackend.ToBackendRequestInfoNameEnum[] = [
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCompleteUserRegistration,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRegisterUser,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendResendUserEmail,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendConfirmUserEmail,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendResetUserPassword,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendUpdateUserPassword,
    // user
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetUserName,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetUserTimezone,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetAvatar,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteUser,
    // org account
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetOrgInfo,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetOrgOwner,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteOrg,
    // project settings
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetProjectInfo,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteProject,
    // project team
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateMember,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteMember,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditMember,
    // project connections
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateConnection,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteConnection,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditConnection,
    // navbar
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateOrg,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateProject,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateBranch,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteBranch,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendMergeRepo,
    // special
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetAvatarBig,
    // blockml tree
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateFolder,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateFile,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteFolder,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteFile,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRenameCatalogNode,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendMoveCatalogNode,
    // blockml editor
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSaveFile,
    // blockml
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCommitRepo,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendPushRepo,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendPullRepo,
    // blockml repo options
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRevertRepoToLastCommit,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRevertRepoToProduction,
    // model
    apiToBackend.ToBackendRequestInfoNameEnum
      .ToBackendCreateTempMconfigAndQuery,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRunQueriesDry,
    // apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRunQueries,
    // apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCancelQueries,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateViz,
    // visualizations
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteViz,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendModifyViz,
    // dashboards
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateTempDashboard,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateDashboard
  ];

  constructor(
    private authHttpClient: HttpClient,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private myDialogService: MyDialogService,
    private navigateService: NavigateService
  ) {}

  req(
    pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum,
    payload: any,
    skipSpinner?: boolean
  ): Observable<any> {
    let bypassAuth = [
      apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser
      // api.PATH_REGISTER_USER,
      // api.PATH_VERIFY_USER_EMAIL,
      // api.PATH_CONFIRM_USER_EMAIL,
      // api.PATH_LOGIN_USER,
      // api.PATH_RESET_USER_PASSWORD,
      // api.PATH_UPDATE_USER_PASSWORD
    ];

    let headers: HttpHeaders = new HttpHeaders({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Authorization:
        bypassAuth.indexOf(pathInfoName) < 0
          ? `Bearer ${localStorage.getItem(constants.LOCAL_STORAGE_TOKEN)}`
          : ''
    });

    let url =
      environment.httpUrl +
      '/' +
      // + commonConstants.API_PATH + '/'
      pathInfoName;

    let body: apiToBackend.ToBackendRequest = {
      info: {
        traceId: common.makeId(),
        name: pathInfoName,
        idempotencyKey: common.makeId()
      },
      payload: payload
    };

    let options = {
      headers: headers,
      body: body, // https://github.com/angular/angular/issues/10612
      observe: <any>'response'
      // responseType: 'json',
    };

    // let spinnerStartedTs: number;

    if (skipSpinner !== true && this.showSpinner.includes(pathInfoName)) {
      // spinnerStartedTs = Date.now();
      this.spinner.show(constants.APP_SPINNER_NAME);
    }

    return combineLatest([
      timer(
        this.showSpinner.includes(pathInfoName) ? constants.MIN_TIME_TO_SPIN : 0
      ),
      this.authHttpClient.request('post', url, options)
    ]).pipe(
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
        if (this.showSpinner.includes(pathInfoName)) {
          // let endedTs = Date.now();

          // let spinTimeAlready = endedTs - spinnerStartedTs;
          // console.log('spinTimeAlready:', spinTimeAlready);

          // let time = constants.MIN_TIME_TO_SPIN - spinTimeAlready;
          // console.log('time:', time);

          // if (time > 0) {
          //   setTimeout(() => this.spinner.hide(constants.APP_SPINNER_NAME), time);
          // } else {
          //   this.spinner.hide(constants.APP_SPINNER_NAME);
          // }

          this.spinner.hide(constants.APP_SPINNER_NAME);
        }
      })
    );
  }

  private mapRes(item: {
    res: any;
    req: {
      url: string;
      headers: any;
      body: any;
    };
  }) {
    let { res, req } = item;

    let errorData: interfaces.ErrorData = {
      reqUrl: req.url,
      reqHeaders: req.headers,
      reqBody: req.body,
      response: res,
      message:
        res.status !== 201
          ? enums.ErEnum.FRONT_RESPONSE_CODE_IS_NOT_201
          : res.body?.info?.status !== common.ResponseInfoStatusEnum.Ok
          ? enums.ErEnum.FRONT_RESPONSE_INFO_STATUS_IS_NOT_OK
          : undefined
    };

    if (common.isDefined(errorData.message)) {
      if (
        [apiToBackend.ErEnum.BACKEND_USER_DOES_NOT_EXIST].indexOf(
          res.body?.info?.error?.message
        ) > -1
      ) {
        this.authService.logout();
      }

      if (
        errorData.message ===
          enums.ErEnum.FRONT_RESPONSE_INFO_STATUS_IS_NOT_OK &&
        errorData.response.body.info.error.message ===
          apiToBackend.ErEnum.BACKEND_ERROR_RESPONSE_FROM_DISK &&
        errorData.response.body.info.error.originalError?.message ===
          apiToDisk.ErEnum.DISK_REPO_IS_NOT_CLEAN_FOR_CHECKOUT_BRANCH
      ) {
        let currentBranchId =
          errorData.response.body.info.error.originalError.data.currentBranch;

        setTimeout(() => {
          this.navigateService.navigateToBlockml(currentBranchId);

          this.myDialogService.showError({
            errorData: {
              message:
                enums.ErEnum
                  .CAN_NOT_SWITCH_BRANCH_WHILE_IT_HAS_UNCOMMITTED_CHANGES
            },
            isThrow: false
          });
        }, 0);
      } else {
        this.myDialogService.showError({ errorData, isThrow: true });
      }

      return { errorData: errorData };
    }

    return res.body;
  }

  private catchErr(e: any) {
    if (e.message === constants.SPECIAL_ERROR) {
      return EMPTY;
    }

    let errorData: interfaces.ErrorData = {
      originalError: e,
      message:
        e instanceof HttpErrorResponse
          ? enums.ErEnum.FRONT_INSTANCE_OF_HTTP_ERROR_RESPONSE
          : e instanceof TimeoutError
          ? enums.ErEnum.FRONT_INSTANCE_OF_TIMEOUT_ERROR
          : enums.ErEnum.FRONT_API_UNKNOWN_ERROR
    };

    this.myDialogService.showError({ errorData, isThrow: false });

    return EMPTY;
  }
}
