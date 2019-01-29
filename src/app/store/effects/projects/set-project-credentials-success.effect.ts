import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from '@app/store/actions/_index';
import * as actionTypes from '@app/store/action-types';

@Injectable()
export class SetProjectCredentialsSuccessEffect {
  @Effect() setProjectCredentialsSuccess$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.SET_PROJECT_CREDENTIALS_SUCCESS),
    mergeMap((action: actions.SetProjectCredentialsSuccessAction) =>
      from([
        new actions.UpdateProjectsStateAction([action.payload.project]),
        new actions.ProcessStructsAction(
          action.payload.dev_and_prod_structs_or_empty
        )
      ])
    )
  );

  constructor(private actions$: Actions) {}
}
