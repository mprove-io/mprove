import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from '@app/store/actions/_index';
import * as actionTypes from '@app/store/action-types';

@Injectable()
export class SaveFileSuccessEffect {
  @Effect() saveFileSuccess$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.SAVE_FILE_SUCCESS),
    mergeMap((action: actions.SaveFileSuccessAction) =>
      from([
        new actions.UpdateFilesStateAction([action.payload.saved_dev_file]),
        new actions.SetLayoutNeedSaveFalseAction(), // special for this scenario
        new actions.ProcessStructsAction([action.payload.dev_struct])
      ])
    )
  );

  constructor(private actions$: Actions) {}
}
