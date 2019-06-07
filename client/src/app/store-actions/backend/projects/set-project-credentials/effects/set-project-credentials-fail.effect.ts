import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as actionTypes from '@app/store-actions/action-types';
import * as api from '@app/api/_index';
import * as services from '@app/services/_index';
import * as helper from '@app/helper/_index';

@Injectable()
export class SetProjectCredentialsFailEffect {
  @Effect() setProjectCredentialsFail$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.SET_PROJECT_CREDENTIALS_FAIL),
    mergeMap((action: actions.SetProjectCredentialsFailAction) => {
      let status = helper.getResponseBodyInfoStatus(action.payload.error);

      let message = helper.getResponseBodyInfoErrorMessage(
        action.payload.error
      );

      if (
        status &&
        [
          api.ServerResponseStatusEnum
            .SET_PROJECT_CREDENTIALS_ERROR_JSON_NOT_VALID,
          api.ServerResponseStatusEnum
            .SET_PROJECT_CREDENTIALS_ERROR_CAN_NOT_CREATE_DATASET
        ].indexOf(status) > -1
      ) {
        this.myDialogService.showInfoDialog(status);

        return of({ type: 'EMPTY ACTION' });
      } else if (
        status &&
        [
          api.ServerResponseStatusEnum
            .SET_PROJECT_CREDENTIALS_ERROR_CAN_NOT_CREATE_SCHEMA_POSTGRES
        ].indexOf(status) > -1
      ) {
        this.myDialogService.showInfoDialog(message);

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
    private myDialogService: services.MyDialogService
  ) {}
}
