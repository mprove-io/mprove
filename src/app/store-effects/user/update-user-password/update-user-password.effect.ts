import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actions from '@app/store-actions/_index';
import * as actionTypes from '@app/store-action-types/index';
import * as services from '@app/services/_index';

@Injectable()
export class UpdateUserPasswordEffect {
  @Effect() updateUserPassword$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.UPDATE_USER_PASSWORD),
    mergeMap((action: actions.UpdateUserPasswordAction) =>
      this.backendService.updateUserPassword(action.payload).pipe(
        map(body => new actions.UpdateUserPasswordSuccessAction(body.payload)),
        catchError(e =>
          of(new actions.UpdateUserPasswordFailAction({ error: e }))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService
  ) {}
}
