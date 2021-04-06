import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
// import { Store } from '@ngrx/store';
import {
  combineLatest,
  Observable,
  throwError,
  TimeoutError,
  timer
} from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { enums } from '~front/barrels/enums';
import { environment } from '~front/environments/environment';
import { ClientError } from '../models/client-error';
import { AuthService } from './auth.service';
// import { PrinterService } from '@app/services/printer.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  noMainLoading: string[] = [
    // api.PATH_CONFIRM,
    // api.PATH_PONG,
    // api.PATH_CREATE_MCONFIG,
    // api.PATH_CREATE_MCONFIG_AND_QUERY,
    // api.PATH_CREATE_DASHBOARD,
    // api.PATH_CHECK_PROJECT_ID_UNIQUE,
    // api.PATH_RUN_QUERIES_DRY
  ];

  constructor(
    // private printer: PrinterService,
    private authHttpClient: HttpClient,
    // private store: Store<interfaces.AppState>,
    private authService: AuthService,
    private spinner: NgxSpinnerService
  ) {}

  req(
    pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum,
    payload: any
  ): Observable<any> {
    let bypassAuthPaths = [
      apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser
      // api.PATH_REGISTER_USER,
      // api.PATH_VERIFY_USER_EMAIL,
      // api.PATH_CONFIRM_USER_EMAIL,
      // api.PATH_LOGIN_USER,
      // api.PATH_RESET_USER_PASSWORD,
      // api.PATH_UPDATE_USER_PASSWORD
    ];

    if (
      !this.authService.authenticated() &&
      bypassAuthPaths.indexOf(pathInfoName) < 0
    ) {
      // this.printer.log(
      //   enums.busEnum.MY_HTTP_SERVICE,
      //   'not authenticated, dispatching Logout...'
      // );
      // this.store.dispatch(new actions.LogoutUserAction({ empty: true }));
      // return throwError(
      //   new MyError({
      //     name: `[MyHttpService] not authenticated`,
      //     message: 'Request not sent because not authenticated'
      //   })
      // );
    }

    // verify required parameter 'payload' is not null or undefined
    if (common.isUndefined(payload)) {
      // return throwError(
      //   new MyError({
      //     name: `[MyHttpService] no payload`,
      //     message: 'Request not sent because no payload'
      //   })
      // );
    }

    let headers: HttpHeaders = new HttpHeaders({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Authorization:
        bypassAuthPaths.indexOf(pathInfoName) < 0
          ? `Bearer ${localStorage.getItem('token')}`
          : ''
    });

    // let requestId = uuid.v4();

    // let initId: string;

    // this.store
    //   .select(selectors.getWebSocketInitId)
    //   .pipe(take(1))
    //   .subscribe(x => (initId = x));

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

    if (!this.noMainLoading.includes(pathInfoName)) {
      this.spinner.show();
    }

    return combineLatest([
      timer(1500),
      this.authHttpClient.request('post', url, options)
    ]).pipe(
      map(x => this.mapRes(x[1])),
      catchError(e => this.catchErr(e)),
      finalize(() => {
        if (!this.noMainLoading.includes(pathInfoName)) {
          // setTimeout(() => this.spinner.hide(), 100);
          this.spinner.hide();
        }
      })
    );
  }

  private mapRes(res: any) {
    // console.log(res);

    // let resData = {
    //   request: {
    //     url: url,
    //     options: options
    //   },
    //   response: res,
    //   e: <any>null
    // };

    console.log(res);

    if (res.status !== 200) {
      // throw new MyError(
      //   Object.assign({}, resData, {
      //     name: `[MyHttpService] ${res.status} - response code is not 200`,
      //     message: undefined
      //   })
      // );
      throw new ClientError({
        message: enums.ErEnum.FRONT_RESPONSE_CODE_IS_NOT_201,
        // reqInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
        reqTraceId: '1234e2341e',
        // reqIdempotencyKey: '5324g5235g34',
        response: res
      });
    } else if (!res.body.info) {
      // throw new MyError(
      //   Object.assign({}, resData, {
      //     name: `[MyHttpService] ServerResponse does not have info`,
      //     message: undefined
      //   })
      // );
    } else if (res.body.info.status !== common.ResponseInfoStatusEnum.Ok) {
      // throw new MyError(
      //   Object.assign({}, resData, {
      //     name: `[MyHttpService] ServerResponse status is ${res.body.info.status} (not Ok)`,
      //     message: undefined
      //   })
      // );
    }

    return res.body;
  }

  private catchErr(e: any) {
    // console.log(e);

    // let eData = {
    //   request: {
    //     url: url,
    //     options: options
    //   },
    //   response: <any>null,
    //   e: e
    // };

    if (e.data) {
      // return throwError(e);
    } else if (e instanceof HttpErrorResponse) {
      // return throwError(
      //   new MyError(
      //     Object.assign({}, eData, {
      //       name: `[MyHttpService] instance of HttpErrorResponse, Code is ${e.status}`,
      //       message: undefined
      //     })
      //   )
      // );
    } else if (e instanceof TimeoutError) {
      // return throwError(
      //   new MyError(
      //     Object.assign({}, eData, {
      //       name: `[MyHttpService] Delay exceeded`,
      //       message: undefined
      //     })
      //   )
      // );
    } else {
      // return throwError(
      //   new MyError(
      //     Object.assign({}, eData, {
      //       name: `[MyHttpService] Other`,
      //       message: undefined
      //     })
      //   )
      // );
    }

    return throwError(e.message);
  }
}
