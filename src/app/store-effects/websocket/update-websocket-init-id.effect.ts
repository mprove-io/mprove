import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as actions from '@app/store-actions/_index';
import * as actionTypes from '@app/store-action-types/index';

@Injectable()
export class UpdateWebSocketInitIdEffect {
  @Effect() updateWebSocketInitId$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.UPDATE_WEBSOCKET_INIT_ID),
    map(
      (action: actions.UpdateWebSocketInitIdAction) =>
        new actions.OpenWebSocketAction()
    )
  );

  constructor(private actions$: Actions) {}
}
