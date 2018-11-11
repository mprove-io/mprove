import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';
import * as services from 'app/services/_index';

@Injectable()
export class SetProjectWeekStartEffect {

  @Effect() setProjectWeekStart$: Observable<Action> = this.actions$
    .ofType(actionTypes.SET_PROJECT_WEEK_START)
    .pipe(
      mergeMap((action: actions.SetProjectWeekStartAction) =>
        this.backendService.setProjectWeekStart(action.payload)
          .pipe(
            map(body => new actions.SetProjectWeekStartSuccessAction(body.payload)),
            catchError(e => of(new actions.SetProjectWeekStartFailAction({ error: e })))
          )
      )
    );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService) {
  }

}
