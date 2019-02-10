import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from '@app/store-actions/_index';
import * as actionTypes from '@app/store-action-types/index';
import { ServerResponseStatusEnum } from '@app/api/_index';
import { MyDialogService } from '@app/services/_index';

@Injectable()
export class RegisterUserFailEffect {
  @Effect() registerUserFail$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.REGISTER_USER_FAIL),
    mergeMap((action: actions.RegisterUserFailAction) => {
      let e = action.payload.error;

      if (
        e &&
        e.data &&
        e.data.response &&
        e.data.response.body &&
        e.data.response.body.info &&
        [ServerResponseStatusEnum.REGISTER_ERROR_USER_ALREADY_EXISTS].indexOf(
          e.data.response.body.info.status
        ) > -1
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
    private myDialogService: MyDialogService
  ) {}
}
