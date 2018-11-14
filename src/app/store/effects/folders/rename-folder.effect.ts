import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';
import * as services from 'app/services/_index';

@Injectable()
export class RenameFolderEffect {
  @Effect() renameFolder$: Observable<Action> = this.actions$
    .ofType(actionTypes.RENAME_FOLDER)
    .pipe(
      mergeMap((action: actions.RenameFolderAction) =>
        this.backendService.renameFolder(action.payload).pipe(
          map(body => new actions.RenameFolderSuccessAction(body.payload)),
          catchError(e => of(new actions.RenameFolderFailAction({ error: e })))
        )
      )
    );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService
  ) {}
}
