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

@Injectable({ providedIn: 'root' })
export class ApiService {
  showSpinner: apiToBackend.ToBackendRequestInfoNameEnum[] = [
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRegisterUser,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendResendUserEmail,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendConfirmUserEmail,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendResetUserPassword,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendUpdateUserPassword,
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetUserName
  ];

  constructor(
    private authHttpClient: HttpClient,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private myDialogService: MyDialogService
  ) {}

  req(
    pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum,
    payload: any
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
          ? `Bearer ${localStorage.getItem('token')}`
          : ''
    });

    let url = environment.httpUrl + '/' + pathInfoName;

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

    if (this.showSpinner.includes(pathInfoName)) {
      // spinnerStartedTs = Date.now();
      this.spinner.show();
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
          //   setTimeout(() => this.spinner.hide(), time);
          // } else {
          //   this.spinner.hide();
          // }

          this.spinner.hide();
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
      this.myDialogService.showError({ errorData, isThrow: true });
    }

    // throw new Error('apiService mapRes');

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
