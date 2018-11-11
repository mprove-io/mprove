import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';

@Injectable()
export class MessagesReceivedEffect {

  @Effect() messagesReceived$: Observable<Action> = this.actions$
    .ofType(actionTypes.STATE_RECEIVED)
    .pipe(
      mergeMap((action: any) => [ // TODO: check need of from()
        new actions.ConfirmAction({ reply_to: action.payload.info.request_id }),
        new actions.UpdateLayoutLastWebsocketMessageTimestampAction(Date.now())
      ]
      )
    );

  constructor(
    private actions$: Actions) {
  }

}
