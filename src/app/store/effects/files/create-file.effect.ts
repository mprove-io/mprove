import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actionTypes from 'app/store/action-types';
import * as actions from 'app/store/actions/_index';
import * as services from 'app/services/_index';

@Injectable()
export class CreateFileEffect {
  @Effect() createFile$: Observable<Action> = this.actions$
    .ofType(actionTypes.CREATE_FILE)
    .pipe(
      mergeMap((action: actions.CreateFileAction) =>
        this.backendService.createFile(action.payload).pipe(
          map(body => new actions.CreateFileSuccessAction(body.payload)),
          catchError(e => of(new actions.CreateFileFailAction({ error: e })))
        )
      )
    );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService
  ) {}
}
