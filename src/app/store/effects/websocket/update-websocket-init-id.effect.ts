import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as actions from 'src/app/store/actions/_index';
import * as actionTypes from 'src/app/store/action-types';

@Injectable()
export class UpdateWebSocketInitIdEffect {

  @Effect() updateWebSocketInitId$: Observable<Action> = this.actions$
    .ofType(actionTypes.UPDATE_WEBSOCKET_INIT_ID)
    .pipe(
      map((action: actions.UpdateWebSocketInitIdAction) => new actions.RestartWebSocketAction())
    );

  constructor(
    private actions$: Actions) {
  }

}
