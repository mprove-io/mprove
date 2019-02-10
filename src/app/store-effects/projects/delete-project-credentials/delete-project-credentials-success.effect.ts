import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from '@app/store-actions/_index';
import * as actionTypes from '@app/store-action-types/index';

@Injectable()
export class DeleteProjectCredentialsSuccessEffect {
  @Effect() deleteProjectCredentialsSuccess$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.DELETE_PROJECT_CREDENTIALS_SUCCESS),
    mergeMap((action: actions.DeleteProjectCredentialsSuccessAction) =>
      from([new actions.UpdateProjectsStateAction([action.payload.project])])
    )
  );

  constructor(private actions$: Actions) {}
}
