import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TdLoadingService } from '@covalent/core';
import { Store } from '@ngrx/store';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as api from 'app/api/_index';
import * as configs from 'app/configs/_index';
import * as enums from 'app/enums/_index';
import * as interfaces from 'app/interfaces/_index';
import { MyError } from 'app/models/my-error';
import * as selectors from 'app/store/selectors/_index';
import * as uuid from 'uuid';
import { PrinterService } from 'app/services/printer.service';
import { AuthService } from 'app/services/auth.service';

@Injectable()
export class MyHttpService {
  noMainLoading: string[] = [
    api.PATH_CONFIRM,
    api.PATH_PONG,
    api.PATH_CREATE_MCONFIG,
    api.PATH_CREATE_MCONFIG_AND_QUERY,
    api.PATH_CREATE_DASHBOARD,
    api.PATH_CHECK_PROJECT_ID_UNIQUE,
    api.PATH_RUN_QUERIES_DRY
  ];

  protected httpUrl = configs.pathConfig.httpUrl;

  constructor(
    private printer: PrinterService,
    private authHttpClient: HttpClient,
    private store: Store<interfaces.AppState>,
    private loadingService: TdLoadingService,
    private auth: AuthService
  ) {}

  req(path: string, payload: object): Observable<any> {
    let bypassAuthPaths = [
      api.PATH_REGISTER_USER,
      api.PATH_VERIFY_USER_EMAIL,
      api.PATH_CONFIRM_USER_EMAIL,
      api.PATH_LOGIN_USER
    ];

    if (!this.auth.authenticated() && bypassAuthPaths.indexOf(path) < 0) {
      this.printer.log(
        enums.busEnum.MY_HTTP_SERVICE,
        'not authenticated, dispatching Logout...'
      );
      this.store.dispatch(new actions.LogoutUserAction({ empty: true }));

      return throwError(
        new MyError({
          name: `[MyHttpService] not authenticated`,
          message: 'Request not sent because not authenticated'
        })
      );
    }

    // verify required parameter 'payload' is not null or undefined
    if (payload === null || payload === undefined) {
      return throwError(
        new MyError({
          name: `[MyHttpService] no payload`,
          message: 'Request not sent because no payload'
        })
      );
    }

    let url = this.httpUrl + path;

    // url = 'https://t.mprove.io/check/code/400';
    // const url = 'http://httpstat.us/500';

    let headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    let requestId = uuid.v4();

    let initId: string;

    this.store
      .select(selectors.getWebSocketInitId)
      .pipe(take(1))
      .subscribe(x => (initId = x));

    let body = {
      info: {
        type: api.CommunicationTypeEnum.REQUEST,
        origin: api.CommunicationOriginEnum.CLIENT,
        request_id: requestId,
        init_id: initId
      },
      payload: payload
    };

    let options = {
      headers: headers,
      body: JSON.stringify(body), // https://github.com/angular/angular/issues/10612
      observe: <any>'response'
      // responseType: 'json',
    };

    if (!this.noMainLoading.includes(path)) {
      this.loadingService.register('app');
    }

    return this.authHttpClient.request('post', url, options).pipe(
      map((res: HttpResponse<any>) => {
        // console.log('res:');
        // console.log(res);

        let resData = {
          request: {
            url: url,
            options: Object.assign({}, options, {
              body: JSON.parse(options.body)
            })
          },
          response: res,
          e: <any>null
        };

        if (res.status !== 200) {
          throw new MyError(
            Object.assign({}, resData, {
              name: `[MyHttpService] ${res.status} - response code is not 200`,
              message: `-`
            })
          );
        } else if (!res.body.info) {
          throw new MyError(
            Object.assign({}, resData, {
              name: `[MyHttpService] ServerResponse does not have info`,
              message: `-`
            })
          );
        } else if (res.body.info.status !== api.ServerResponseStatusEnum.Ok) {
          throw new MyError(
            Object.assign({}, resData, {
              name: `[MyHttpService] ServerResponse status is ${
                res.body.info.status
              } (not Ok)`,
              message: `-`
            })
          );
        } else {
          if (!this.noMainLoading.includes(path)) {
            setTimeout(() => this.loadingService.resolve('app'), 100);
          }

          return res.body;
        }
      }),
      // timeout(600000),
      // retry(1),
      catchError(e => {
        // console.log(e);

        let eData = {
          request: {
            url: url,
            options: Object.assign({}, options, {
              body: JSON.parse(options.body)
            })
          },
          response: <any>null,
          e: e
        };

        if (path !== '/confirm' && path !== '/pong') {
          setTimeout(() => this.loadingService.resolve('app'), 100);
        }

        if (e.data) {
          return throwError(e);
        } else if (e instanceof HttpErrorResponse) {
          return throwError(
            new MyError(
              Object.assign({}, eData, {
                name: `[MyHttpService] instance of HttpErrorResponse, Code is ${
                  e.status
                }`,
                message: `-`
              })
            )
          );
        } else if (e instanceof TimeoutError) {
          return throwError(
            new MyError(
              Object.assign({}, eData, {
                name: `[MyHttpService] Delay exceeded`,
                message: '-'
              })
            )
          );
        } else {
          return throwError(
            new MyError(
              Object.assign({}, eData, {
                name: `[MyHttpService] Other`,
                message: '-'
              })
            )
          );
        }
      })
    );
  }
}
