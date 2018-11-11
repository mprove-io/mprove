import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import * as actions from 'src/app/store/actions/_index';
import * as actionTypes from 'src/app/store/action-types';
import * as interfaces from 'src/app/interfaces/_index';
import * as selectors from 'src/app/store/selectors/_index';

@Injectable()
export class RestartWebSocketEffect {

  @Effect() restartWebSocket$: Observable<Action> = this.actions$
    .ofType(actionTypes.RESTART_WEBSOCKET)
    .pipe(
      map((action: actions.RestartWebSocketAction) => {

        let wsOpen: boolean = false;
        this.store.select(selectors.getWebSocketIsOpen)
          .pipe(take(1))
          .subscribe(isOpen => wsOpen = isOpen);

        if (wsOpen) {
          return new actions.CloseWebSocketAction();
        } else {
          return new actions.OpenWebSocketAction();
        }
      })
    );

  constructor(
    private actions$: Actions,
    private store: Store<interfaces.AppState>) {
  }

}
