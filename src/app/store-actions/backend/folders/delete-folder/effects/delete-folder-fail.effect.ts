import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as actionTypes from '@app/store-actions/action-types';

@Injectable()
export class DeleteFolderFailEffect {
  @Effect() deleteFolderFail$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.DELETE_FOLDER_FAIL),
    mergeMap((action: actions.DeleteFolderFailAction) => {
      return of(new actions.BackendFailAction({ error: action.payload.error }));
    })
  );

  constructor(private actions$: Actions) {}
}
