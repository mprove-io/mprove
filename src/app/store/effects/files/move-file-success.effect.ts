import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actionTypes from 'src/app/store/action-types';
import * as actions from 'src/app/store/actions/_index';

@Injectable()
export class MoveFileSuccessEffect {

  @Effect() moveFileSuccess$: Observable<Action> = this.actions$
    .ofType(actionTypes.MOVE_FILE_SUCCESS)
    .pipe(
      mergeMap((action: actions.MoveFileSuccessAction) => from([
        new actions.UpdateFilesStateAction(
          [
            action.payload.deleted_dev_file,
            action.payload.new_dev_file
          ]),
        new actions.ProcessStructsAction([action.payload.dev_struct]),
      ])
      )
    );

  constructor(
    private actions$: Actions) {
  }

}
