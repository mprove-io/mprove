import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actionTypes from '@app/store-action-types/index';
import * as actions from '@app/store-actions/_index';
import * as services from '@app/services/_index';

@Injectable()
export class DeleteFileEffect {
  @Effect() deleteFile$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.DELETE_FILE),
    mergeMap((action: actions.DeleteFileAction) =>
      this.backendService.deleteFile(action.payload).pipe(
        map(body => new actions.DeleteFileSuccessAction(body.payload)),
        catchError(e => of(new actions.DeleteFileFailAction({ error: e })))
      )
    )
  );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService
  ) {}
}
