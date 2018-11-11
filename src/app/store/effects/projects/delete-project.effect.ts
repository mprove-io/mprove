import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actions from 'src/app/store/actions/_index';
import * as actionTypes from 'src/app/store/action-types';
import * as services from 'src/app/services/_index';

@Injectable()
export class DeleteProjectEffect {

  @Effect() deleteProject$: Observable<Action> = this.actions$
    .ofType(actionTypes.DELETE_PROJECT)
    .pipe(
      mergeMap((action: actions.DeleteProjectAction) =>
        this.backendService.deleteProject(action.payload)
          .pipe(
            map(body => new actions.DeleteProjectSuccessAction(body.payload)),
            catchError(e => of(new actions.DeleteProjectFailAction({ error: e })))
          )
      )
    );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService) {
  }

}
