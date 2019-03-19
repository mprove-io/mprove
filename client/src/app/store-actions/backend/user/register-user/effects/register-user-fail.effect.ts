import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as actionTypes from '@app/store-actions/action-types';
import { ServerResponseStatusEnum } from '@app/api/_index';
import { MyDialogService } from '@app/services/_index';
import * as helper from '@app/helper/_index';

@Injectable()
export class RegisterUserFailEffect {
  @Effect() registerUserFail$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.REGISTER_USER_FAIL),
    mergeMap((action: actions.RegisterUserFailAction) => {
      let status = helper.getResponseBodyInfoStatus(action.payload.error);
      if (
        status &&
        [
          ServerResponseStatusEnum.REGISTER_ERROR_USER_ALREADY_EXISTS,
          ServerResponseStatusEnum.REGISTER_ERROR_USER_IS_NOT_INVITED
        ].indexOf(status) > -1
      ) {
        this.myDialogService.showInfoDialog(status);

        return of({ type: 'EMPTY ACTION' });
      } else {
        return of(
          new actions.BackendFailAction({ error: action.payload.error })
        );
      }
    })
  );

  constructor(
    private actions$: Actions,
    private myDialogService: MyDialogService
  ) {}
}
