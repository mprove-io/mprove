import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  type HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { defer, type Observable, of, TimeoutError, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { LOCAL_STORAGE_TOKEN } from '#common/constants/top-front';
import { makeId } from '#common/functions/make-id/make-id';
import { makeToBackendRequest } from '#common/functions/make-to-backend-request/make-to-backend-request';
import type { ToBackendInputForRoute } from '#common/types/backend/request/to-backend-input-for-route';
import type { ToBackendRequest } from '#common/types/backend/request/to-backend-request';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendResponse } from '#common/types/backend/response/to-backend-response';
import type { ToBackendResponseForRoute } from '#common/types/backend/response/to-backend-response-for-route';
import { presentApiError } from '#front/app/functions/present-api-error/present-api-error';
import { environment } from '#front/environments/environment';
import { NavQuery } from '../queries/nav.query';
import { UiQuery } from '../queries/ui.query';
import type {
  ApiRequestContext,
  ApiRequestFailure
} from '../types/api-request-failure';
import type { ApiResponseForRoute } from '../types/api-response-for-route';
import { AuthService } from './auth.service';
import { MyDialogService } from './my-dialog.service';
import { NavigateService } from './navigate.service';

// Expose the variants so inline discriminator checks also narrow generic routes.
type ApiResponse<TResponse extends ToBackendResponse> =
  | Extract<TResponse, { type: 'Success' }>
  | Extract<TResponse, { type: 'Failure' }>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(
    private router: Router,
    private navQuery: NavQuery,
    private authHttpClient: HttpClient,
    private uiQuery: UiQuery,
    private myDialogService: MyDialogService,
    private navigateService: NavigateService,
    private authService: AuthService
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

  req<TRoute extends ToBackendRoute>(item: {
    route: TRoute;
    payload: ToBackendInputForRoute<NoInfer<TRoute>>;
  }): Observable<ApiResponseForRoute<TRoute>> {
    let { route, payload } = item;

    let response: Observable<ApiResponseForRoute<TRoute>> = defer(() => {
      let url: string = `${environment.httpUrl}/${route}`;

      let body: ToBackendRequest = makeToBackendRequest({
        route: route,
        traceId: makeId(),
        idempotencyKey: makeId(),
        input: payload
      });

      let headers: HttpHeaders = this.headers({ route: route });

      let context: ApiRequestContext = {
        url: url,
        operation: body.operation,
        traceId: body.traceId
      };

      // HTTP response types are trusted backend contracts, not runtime validation.
      // Catch only HTTP execution errors, before response mapping or consumer code.
      let httpExecution: Observable<
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

      let execution: Observable<ApiResponseForRoute<TRoute>> =
        httpExecution.pipe(
          map((httpResponse): ApiResponseForRoute<TRoute> => {
            context.status =
              httpResponse instanceof TimeoutError
                ? undefined
                : httpResponse.status;
            context.response =
              httpResponse instanceof TimeoutError
                ? undefined
                : { statusText: httpResponse.statusText };

            if (httpResponse instanceof TimeoutError) {
              let failure: ApiResponseForRoute<TRoute> = {
                type: 'Failure',
                error: { code: 'FRONT_REQUEST_TIMEOUT' },
                context: context
              };

              return failure;
            }

            // Angular's HTTP error body is trusted to use the same route contract.
            let apiResponse: ApiResponse<ToBackendResponseForRoute<TRoute>> =
              httpResponse instanceof HttpErrorResponse
                ? httpResponse.error
                : httpResponse.body;

            if (apiResponse) {
              context.response = {
                operation: apiResponse.operation,
                method: apiResponse.method,
                duration: apiResponse.duration,
                traceId: apiResponse.traceId,
                mproveVersion: apiResponse.mproveVersion
              };

              if (apiResponse.type === 'Failure') {
                let failure: ApiResponseForRoute<TRoute> = apiResponse;

                return failure;
              }

              if (
                !(httpResponse instanceof HttpErrorResponse) &&
                httpResponse.status === 201 &&
                apiResponse.type === 'Success'
              ) {
                let response: ApiResponseForRoute<TRoute> = apiResponse;

                return response;
              }
            }

            if (
              httpResponse instanceof HttpErrorResponse &&
              httpResponse.status === 0
            ) {
              let failure: ApiResponseForRoute<TRoute> = {
                type: 'Failure',
                error: { code: 'FRONT_REQUEST_FAILED' },
                context: context
              };

              return failure;
            }

            let failure: ApiResponseForRoute<TRoute> = {
              type: 'Failure',
              error: { code: 'FRONT_INVALID_BACKEND_RESPONSE' },
              context: context
            };

            return failure;
          })
        );

      let response: Observable<ApiResponseForRoute<TRoute>> = execution.pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            let failure: ApiRequestFailure<ToBackendResponseForRoute<TRoute>> =
              resp;

            if (
              failure.error.code === 'BACKEND_UNAUTHORIZED' ||
              failure.error.code === 'BACKEND_NOT_AUTHORIZED' ||
              failure.error.code === 'BACKEND_USER_DOES_NOT_EXIST'
            ) {
              this.authService.logout();
            }

            presentApiError<ToBackendResponse>({
              failure: failure,
              context: context,
              router: this.router,
              navQuery: this.navQuery,
              uiQuery: this.uiQuery,
              myDialogService: this.myDialogService,
              navigateService: this.navigateService
            });
          }
        })
      );

      return response;
    });

    return response;
  }
}
