import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';
import * as services from 'app/services/_index';

@Injectable()
export class OpenWebSocketSuccessEffect {
  @Effect({ dispatch: false }) openWebSocketSuccess$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.OPEN_WEBSOCKET_SUCCESS),
    tap((action: actions.OpenWebSocketSuccessAction) => {
      this.watchWebsocketService.start();
    })
  );

  constructor(
    private actions$: Actions,
    private watchWebsocketService: services.WatchWebsocketService
  ) {}
}
