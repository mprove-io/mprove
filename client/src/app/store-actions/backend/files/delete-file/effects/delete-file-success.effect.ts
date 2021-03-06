import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actionTypes from '@app/store-actions/action-types';
import * as actions from '@app/store-actions/actions';

@Injectable()
export class DeleteFileSuccessEffect {
  @Effect() deleteFileSuccess$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.DELETE_FILE_SUCCESS),
    mergeMap((action: actions.DeleteFileSuccessAction) =>
      from([
        new actions.UpdateFilesStateAction([action.payload.deleted_dev_file]),
        new actions.ProcessStructsAction([action.payload.dev_struct])
      ])
    )
  );

  constructor(private actions$: Actions) {}
}
