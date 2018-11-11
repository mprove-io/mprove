import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actions from 'src/app/store/actions/_index';
import * as actionTypes from 'src/app/store/action-types';
import * as services from 'src/app/services/_index';

@Injectable()
export class MoveFileEffect {

  @Effect() moveFile$: Observable<Action> = this.actions$
    .ofType(actionTypes.MOVE_FILE)
    .pipe(
      mergeMap((action: actions.MoveFileAction) => this.backendService.moveFile(action.payload)
        .pipe(
          map(body => new actions.MoveFileSuccessAction(body.payload)),
          catchError(e => of(new actions.MoveFileFailAction({ error: e })))
        )
      )
    );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService) {
  }

}
