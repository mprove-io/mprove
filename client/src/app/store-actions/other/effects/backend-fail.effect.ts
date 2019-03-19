import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';
import * as actions from '@app/store-actions/actions';
import * as services from '@app/services/_index';
import * as interfaces from '@app/interfaces/_index';
import * as helper from '@app/helper/_index';

@Injectable()
export class BackendFailEffect {
  @Effect({ dispatch: false }) backendFail$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.BACKEND_FAIL),
    filter(
      (action: any) =>
        !action.payload.error
          .toString()
          .includes('Request not sent because not authenticated')
    ),
    tap((action: any) => {
      let status = helper.getResponseBodyInfoStatus(action.payload.error);
      if (
        status &&
        [api.ServerResponseStatusEnum.AUTHORIZATION_ERROR].indexOf(status) > -1
      ) {
        this.myDialogService.showInfoDialog(status);
        this.store.dispatch(new actions.LogoutUserAction({ empty: true }));

        return;
      }

      let err = action.payload.error;

      if (!err.data) {
        err.name = `[AppEffects] ${err.message}`;
        err.message = `[AppEffects] ${err.message}: -`;

        err.data = {
          name: err.name,
          message: '-'
        };
      }

      err.name = `${action.type} ${err.name}`;
      err.message = `${action.type} ${err.message}`;

      err.data = {
        name: err.name,
        message: err.data.message
      };

      throw err;
    })
  );

  constructor(
    private actions$: Actions,
    private router: Router,
    private myDialogService: services.MyDialogService,
    private store: Store<interfaces.AppState>
  ) {}
}
