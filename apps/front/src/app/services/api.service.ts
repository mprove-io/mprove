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
  constructor(
    private authHttpClient: HttpClient,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private myDialogService: MyDialogService,
    private navigateService: NavigateService
  ) {}

  req(item: {
    pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum;
    payload: any;
    showSpinner?: boolean;
  }): Observable<any> {
    let { pathInfoName, payload, showSpinner } = item;

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

    if (showSpinner === true) {
      // spinnerStartedTs = Date.now();
      this.spinner.show(constants.APP_SPINNER_NAME);
    }

    return combineLatest([
      timer(showSpinner === true ? constants.MIN_TIME_TO_SPIN : 0),
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
    pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum;
    res: any;
    req: {
      url: string;
      headers: any;
      body: any;
    };
  }) {
    let { res, req, pathInfoName } = item;

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

    let infoErrorMessage = res?.body?.info?.error?.message;

    if (
      common.isDefined(errorData.message) &&
      errorData.message === enums.ErEnum.FRONT_RESPONSE_INFO_STATUS_IS_NOT_OK
    ) {
      if (
        [
          common.ErEnum.BACKEND_UNAUTHORIZED,
          common.ErEnum.BACKEND_NOT_AUTHORIZED,
          common.ErEnum.BACKEND_USER_DOES_NOT_EXIST
        ].indexOf(infoErrorMessage) > -1
      ) {
        this.authService.logout();
      }

      if (
        infoErrorMessage === common.ErEnum.BACKEND_ERROR_RESPONSE_FROM_DISK &&
        errorData.response.body.info.error.originalError?.message ===
          common.ErEnum.DISK_REPO_IS_NOT_CLEAN_FOR_CHECKOUT_BRANCH
      ) {
        let currentBranchId =
          errorData.response.body.info.error.originalError.data.currentBranch;

        setTimeout(() => {
          this.navigateService.navigateToFiles(currentBranchId);

          this.myDialogService.showError({
            errorData: {
              message:
                enums.ErEnum
                  .CAN_NOT_SWITCH_BRANCH_WHILE_IT_HAS_UNCOMMITTED_CHANGES
            },
            isThrow: false
          });
        }, 0);
      } else if (
        [common.ErEnum.BACKEND_FORBIDDEN_DASHBOARD].indexOf(infoErrorMessage) >
        -1
      ) {
        errorData.description = `Check dashboard access rules`;
        errorData.buttonText = 'Ok, go to dashboards';
        errorData.onClickFnBindThis = (() => {
          this.navigateService.navigateToDashboards();
        }).bind(this);

        this.myDialogService.showError({ errorData, isThrow: false });
      } else if (
        [common.ErEnum.BACKEND_FORBIDDEN_MODEL].indexOf(infoErrorMessage) > -1
      ) {
        errorData.description = `Check model access rules`;
        errorData.buttonText = 'Ok, go to models';
        errorData.onClickFnBindThis = (() => {
          this.navigateService.navigateToModels();
        }).bind(this);

        this.myDialogService.showError({ errorData, isThrow: false });
      } else if (
        [
          common.ErEnum.BACKEND_MCONFIG_DOES_NOT_EXIST,
          common.ErEnum.BACKEND_MODEL_DOES_NOT_EXIST,
          common.ErEnum.BACKEND_VIS_DOES_NOT_EXIST,
          common.ErEnum.BACKEND_DASHBOARD_DOES_NOT_EXIST,
          common.ErEnum.BACKEND_STRUCT_ID_CHANGED,
          common.ErEnum.BACKEND_STRUCT_DOES_NOT_EXIST,
          common.ErEnum.BACKEND_QUERY_DOES_NOT_EXIST
        ].indexOf(infoErrorMessage) > -1
      ) {
        errorData.description = `Don't worry, most likely the project editor has pushed new changes to the current branch files recently`;
        errorData.buttonText = 'Ok, reload and fetch changes';
        errorData.onClickFnBindThis = (() => {
          this.navigateService.navigateToModels();
        }).bind(this);

        this.myDialogService.showError({ errorData, isThrow: false });
      } else if (infoErrorMessage === common.ErEnum.BACKEND_RESTRICTED_USER) {
        errorData.description = `This user is restricted for Demo purposes. Sign Up at https://mprove.io to get full access.`;
        this.myDialogService.showError({ errorData, isThrow: false });
      } else if (
        infoErrorMessage === common.ErEnum.BACKEND_RESTRICTED_PROJECT &&
        pathInfoName ===
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendPushRepo
      ) {
        errorData.description = `Some actions of this project is restricted for Demo purposes. Switch organization/project to remove restrictions and be able to push to remote.`;
        this.myDialogService.showError({ errorData, isThrow: false });
      } else if (
        infoErrorMessage === common.ErEnum.BACKEND_RESTRICTED_PROJECT &&
        pathInfoName !==
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendPushRepo
      ) {
        errorData.description = `Some actions of this project is restricted for Demo purposes. Switch organization/project to remove restrictions.`;
        this.myDialogService.showError({ errorData, isThrow: false });
      } else if (
        [
          common.ErEnum.BACKEND_CREATE_DASHBOARD_FAIL,
          common.ErEnum.BACKEND_MODIFY_DASHBOARD_FAIL,
          common.ErEnum.BACKEND_CREATE_VIS_FAIL,
          common.ErEnum.BACKEND_MODIFY_VIS_FAIL
        ].indexOf(infoErrorMessage) > -1
      ) {
        errorData.description = `The changes were saved to the file, but it failed the BlockML validation. It's probably a bug.`;
        errorData.buttonText = 'Ok, go to file';
        errorData.onClickFnBindThis = (() => {
          this.navigateService.navigateToFileLine({
            panel: common.PanelEnum.Tree,
            underscoreFileId:
              errorData.response.body.info.error.data.underscoreFileId
          });
        }).bind(this);

        this.myDialogService.showError({ errorData, isThrow: false });
      } else {
        this.myDialogService.showError({ errorData, isThrow: false });
      }

      return { errorData: errorData };
    } else if (
      common.isDefined(errorData.message) &&
      errorData.message !== enums.ErEnum.FRONT_RESPONSE_INFO_STATUS_IS_NOT_OK
    ) {
      this.myDialogService.showError({ errorData, isThrow: true });

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
