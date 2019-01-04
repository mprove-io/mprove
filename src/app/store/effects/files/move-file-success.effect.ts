import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actionTypes from 'app/store/action-types';
import * as actions from 'app/store/actions/_index';

@Injectable()
export class MoveFileSuccessEffect {
  @Effect() moveFileSuccess$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.MOVE_FILE_SUCCESS),
    mergeMap((action: actions.MoveFileSuccessAction) =>
      from([
        new actions.UpdateFilesStateAction([
          action.payload.deleted_dev_file,
          action.payload.new_dev_file
        ]),
        new actions.ProcessStructsAction([action.payload.dev_struct])
      ])
    )
  );

  constructor(private actions$: Actions) {}
}
