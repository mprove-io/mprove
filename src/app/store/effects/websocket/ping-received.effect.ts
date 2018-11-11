import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from 'src/app/store/actions/_index';
import * as actionTypes from 'src/app/store/action-types';

@Injectable()
export class PingReceivedEffect {

  @Effect() pingReceived$: Observable<Action> = this.actions$
    .ofType(actionTypes.PING_RECEIVED)
    .pipe(
      mergeMap((action: actions.PingReceivedAction) => [ // TODO: check need of from()
        new actions.PongAction({ reply_to: action.payload.info.request_id }),
        new actions.UpdateLayoutLastWebsocketMessageTimestampAction(Date.now())
      ]
      )
    );

  constructor(
    private actions$: Actions) {
  }

}
