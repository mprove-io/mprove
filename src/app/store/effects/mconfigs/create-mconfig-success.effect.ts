import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from 'src/app/store/actions/_index';
import * as actionTypes from 'src/app/store/action-types';

@Injectable()
export class CreateMconfigSuccessEffect {

  @Effect() createMconfigSuccess$: Observable<Action> = this.actions$
    .ofType(actionTypes.CREATE_MCONFIG_SUCCESS)
    .pipe(
      mergeMap((action: actions.CreateMconfigSuccessAction) => from([
        new actions.UpdateMconfigsStateAction([action.payload.mconfig]),
      ])
      )
    );

  constructor(
    private actions$: Actions) {
  }

}
