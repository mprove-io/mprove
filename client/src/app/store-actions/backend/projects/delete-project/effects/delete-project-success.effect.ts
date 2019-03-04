import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as actionTypes from '@app/store-actions/action-types';

@Injectable()
export class DeleteProjectSuccessEffect {
  @Effect() deleteProjectSuccess$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.DELETE_PROJECT_SUCCESS),
    mergeMap((action: actions.DeleteProjectSuccessAction) =>
      from([
        new actions.UpdateProjectsStateAction([action.payload.deleted_project])
      ])
    )
  );

  constructor(private actions$: Actions, private router: Router) {}
}
