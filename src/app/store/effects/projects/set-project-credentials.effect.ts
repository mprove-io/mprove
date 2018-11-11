import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actions from 'src/app/store/actions/_index';
import * as actionTypes from 'src/app/store/action-types';
import * as services from 'src/app/services/_index';

@Injectable()
export class SetProjectCredentialsEffect {

  @Effect() setProjectCredentials$: Observable<Action> = this.actions$
    .ofType(actionTypes.SET_PROJECT_CREDENTIALS)
    .pipe(
      mergeMap((action: actions.SetProjectCredentialsAction) =>
        this.backendService.setProjectCredentials(action.payload)
          .pipe(
            map(body => new actions.SetProjectCredentialsSuccessAction(body.payload)),
            catchError(e => of(new actions.SetProjectCredentialsFailAction({ error: e })))
          )
      )
    );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService) {
  }

}
