import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from 'src/app/store/actions/_index';
import * as actionTypes from 'src/app/store/action-types';

@Injectable()
export class SetProjectQuerySizeLimitSuccessEffect {

  @Effect() setProjectQuerySizeLimitSuccess$: Observable<Action> = this.actions$
    .ofType(actionTypes.SET_PROJECT_QUERY_SIZE_LIMIT_SUCCESS)
    .pipe(
      mergeMap((action: actions.SetProjectQuerySizeLimitSuccessAction) => from([
        new actions.UpdateProjectsStateAction([action.payload.project]),
      ])
      )
    );

  constructor(
    private actions$: Actions) {
  }

}
