import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as actionTypes from '@app/store-actions/action-types';
import * as services from '@app/services/_index';

@Injectable()
export class OpenWebSocketEffect {
  @Effect({ dispatch: false }) openWebSocket$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.OPEN_WEBSOCKET),
    tap((action: actions.OpenWebSocketAction) => this.myWebSocketService.open())
  );

  constructor(
    private actions$: Actions,
    private myWebSocketService: services.MyWebSocketService
  ) {}
}
