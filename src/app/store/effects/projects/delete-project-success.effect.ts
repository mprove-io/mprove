import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import * as actions from 'src/app/store/actions/_index';
import * as actionTypes from 'src/app/store/action-types';

@Injectable()
export class DeleteProjectSuccessEffect {

  @Effect() deleteProjectSuccess$: Observable<Action> = this.actions$
    .ofType(actionTypes.DELETE_PROJECT_SUCCESS)
    .pipe(
      mergeMap((action: actions.DeleteProjectSuccessAction) => from([
        new actions.UpdateProjectsStateAction([action.payload.deleted_project]),
      ])
      ),
      tap(() => this.router.navigate(['project-deleted']))
    );

  constructor(
    private actions$: Actions,
    private router: Router) {
  }

}
