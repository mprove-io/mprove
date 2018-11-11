import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';

@Injectable()
export class SetProjectWeekStartSuccessEffect {

  @Effect() setProjectWeekStartSuccess$: Observable<Action> = this.actions$
    .ofType(actionTypes.SET_PROJECT_WEEK_START_SUCCESS)
    .pipe(
      mergeMap((action: actions.SetProjectWeekStartSuccessAction) => from([
        new actions.UpdateProjectsStateAction([action.payload.project]),
        new actions.ProcessStructsAction([
          action.payload.dev_struct,
          action.payload.prod_struct,
        ]),
      ])
      )
    );

  constructor(
    private actions$: Actions) {
  }

}
