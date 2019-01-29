import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from '@app/store/actions/_index';
import * as actionTypes from '@app/store/action-types';
import * as api from '@app/api/_index';
import * as services from '@app/services/_index';

@Injectable()
export class ResetUserPasswordFailEffect {
  @Effect() resetUserPasswordFail$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.RESET_USER_PASSWORD_FAIL),
    mergeMap((action: actions.ResetUserPasswordFailAction) => {
      let e = action.payload.error;

      if (
        e &&
        e.data &&
        e.data.response &&
        e.data.response.body &&
        e.data.response.body.info &&
        [
          api.ServerResponseStatusEnum.RESET_PASSWORD_ERROR_USER_DOES_NOT_EXIST
        ].indexOf(e.data.response.body.info.status) > -1
      ) {
        this.myDialogService.showInfoDialog(e.data.response.body.info.status);

        return of({ type: 'EMPTY ACTION' });
      } else {
        return of(new actions.BackendFailAction({ error: e }));
      }
    })
  );

  constructor(
    private actions$: Actions,
    private myDialogService: services.MyDialogService
  ) {}
}
