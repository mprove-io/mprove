import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as actionTypes from '@app/store-actions/action-types';
import * as api from '@app/api/_index';
import * as services from '@app/services/_index';

@Injectable()
export class DeleteProjectCredentialsFailEffect {
  @Effect() deleteProjectCredentialsFail$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.DELETE_PROJECT_CREDENTIALS_FAIL),
    mergeMap((action: actions.DeleteProjectCredentialsFailAction) => {
      let e = action.payload.error;

      return of(new actions.BackendFailAction({ error: e }));
    })
  );

  constructor(
    private actions$: Actions,
    private myDialogService: services.MyDialogService
  ) {}
}
