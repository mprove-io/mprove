import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';
import * as services from 'app/services/_index';

@Injectable()
export class CloseWebSocketEffect {
  @Effect({ dispatch: false }) closeWebSocket$: Observable<
    Action
  > = this.actions$
    .ofType(actionTypes.CLOSE_WEBSOCKET)
    .pipe(
      tap((action: actions.CloseWebSocketAction) =>
        this.myWebSocketService.close()
      )
    );

  constructor(
    private actions$: Actions,
    private myWebSocketService: services.MyWebSocketService
  ) {}
}
