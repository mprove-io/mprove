import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as actionTypes from '@app/store-actions/action-types';
import * as services from '@app/services/_index';

@Injectable()
export class MoveFileEffect {
  @Effect() moveFile$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.MOVE_FILE),
    mergeMap((action: actions.MoveFileAction) =>
      this.backendService.moveFile(action.payload).pipe(
        map(body => new actions.MoveFileSuccessAction(body.payload)),
        catchError(e => of(new actions.MoveFileFailAction({ error: e })))
      )
    )
  );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService
  ) {}
}
