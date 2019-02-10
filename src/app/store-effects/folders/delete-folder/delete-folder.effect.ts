import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actions from '@app/store-actions/_index';
import * as actionTypes from '@app/store-action-types/index';
import * as services from '@app/services/_index';

@Injectable()
export class DeleteFolderEffect {
  @Effect() deleteFolder$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.DELETE_FOLDER),
    mergeMap((action: actions.DeleteFolderAction) =>
      this.backendService.deleteFolder(action.payload).pipe(
        map(body => new actions.DeleteFolderSuccessAction(body.payload)),
        catchError(e => of(new actions.DeleteFolderFailAction({ error: e })))
      )
    )
  );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService
  ) {}
}
