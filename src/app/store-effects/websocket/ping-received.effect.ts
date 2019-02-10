import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable, from } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import * as actions from '@app/store-actions/_index';
import * as selectors from '@app/store/selectors/_index';
import * as interfaces from '@app/interfaces/_index';
import * as actionTypes from '@app/store-action-types/index';

@Injectable()
export class PingReceivedEffect {
  @Effect() pingReceived$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.PING_RECEIVED),
    mergeMap((action: actions.PingReceivedAction) => {
      let initId;

      this.store
        .select(selectors.getWebSocketInitId)
        .pipe(take(1))
        .subscribe(x => (initId = x));

      return from([
        new actions.PongAction({ init_id: initId }),
        new actions.UpdateLayoutLastWebsocketMessageTimestampAction(Date.now())
      ]);
    })
  );

  constructor(
    private actions$: Actions,
    private store: Store<interfaces.AppState>
  ) {}
}
