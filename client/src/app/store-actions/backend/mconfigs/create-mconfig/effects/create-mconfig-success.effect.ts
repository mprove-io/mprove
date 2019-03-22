import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as interfaces from '@app/interfaces/_index';
import * as actionTypes from '@app/store-actions/action-types';

@Injectable()
export class CreateMconfigSuccessEffect {
  @Effect({ dispatch: false }) createMconfigSuccess$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.CREATE_MCONFIG_SUCCESS),
    tap((action: actions.CreateMconfigSuccessAction) => {
      this.store.dispatch(
        new actions.UpdateMconfigsStateAction([
          action.payload.api_payload.mconfig
        ])
      );
      action.payload.navigate();
    })
  );

  constructor(
    private actions$: Actions,
    private store: Store<interfaces.AppState>
  ) {}
}
