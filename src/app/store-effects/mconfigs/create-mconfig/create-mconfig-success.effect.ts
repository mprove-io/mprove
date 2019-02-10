import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from '@app/store-actions/_index';
import * as actionTypes from '@app/store-action-types/index';

@Injectable()
export class CreateMconfigSuccessEffect {
  @Effect() createMconfigSuccess$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.CREATE_MCONFIG_SUCCESS),
    mergeMap((action: actions.CreateMconfigSuccessAction) =>
      from([new actions.UpdateMconfigsStateAction([action.payload.mconfig])])
    )
  );

  constructor(private actions$: Actions) {}
}
