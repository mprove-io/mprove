import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as actionTypes from '@app/store-actions/action-types';

@Injectable()
export class MessagesReceivedEffect {
  @Effect() messagesReceived$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.STATE_RECEIVED),
    mergeMap((action: any) => [
      // TODO: #23-1 check need of from()
      new actions.ConfirmAction({ reply_to: action.payload.info.request_id }),
      new actions.UpdateLayoutLastWebsocketMessageTimestampAction(Date.now())
    ])
  );

  constructor(private actions$: Actions) {}
}
