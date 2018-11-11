import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import * as actions from 'src/app/store/actions/_index';
import * as actionTypes from 'src/app/store/action-types';
import * as enums from 'src/app/enums/_index';
import * as interfaces from 'src/app/interfaces/_index';
import { MyError } from 'src/app/models/my-error';
import * as selectors from 'src/app/store/selectors/_index';
import * as services from 'src/app/services/_index';

@Injectable()
export class CloseWebSocketSuccessEffect {

  @Effect({ dispatch: false }) closeWebSocketSuccess$: Observable<Action> = this.actions$
    .ofType(actionTypes.CLOSE_WEBSOCKET_SUCCESS)
    .pipe(
      tap((action: actions.CloseWebSocketSuccessAction) => {

        this.printer.log(enums.busEnum.WEBSOCKET_EFFECTS, 'close event object:', action.payload);

        let id: string;
        this.store.select(selectors.getWebSocketInitId).pipe(take(1)).subscribe(initId2 => id = initId2);

        switch (action.payload.code) {

          case 4500: { // Init_id is dead, get new by getState

            throw new MyError({
              name: `[WebSocketEffects] Websocket closed: ${action.payload.code} - init_id is dead`,
              message: `-`,
            });

            // break;
          }

          case 4501: { // Init_id is missing in url

            throw new MyError({
              name: `[WebSocketEffects] Websocket closed: ${action.payload.code} - init_id is missing in url`,
              message: `-`,
            });

            // break;
          }

          case 4502: { // New session was opened with same init_id on same ip

            // OK, just closed

            break;
          }

          case 4503: { // Init_id already used on other ip

            throw new MyError({
              name: `[WebSocketEffects] Websocket closed: ${action.payload.code} - init_id already used`,
              message: `-`,
            });

            // break;
          }

          case 4504: { // Unanswered ping limit exceeded

            throw new MyError({
              name: `[WebSocketEffects] Websocket closed: ${action.payload.code} - Unanswered ping limit exceeded`,
              message: ``,
            });

            // break;
          }

          case 4505: { // Init_id not found

            throw new MyError({
              name: `[WebSocketEffects] Websocket closed: ${action.payload.code} - init_id not found`,
              message: `-`,
            });

            // break;
          }

          case 4510: { // After Logout

            // OK, just closed

            break;
          }

          case 1006: { // maintenance 1005 => 1006, 1006, 1006

            throw new MyError({
              name: `[WebSocketEffects] Websocket closed: ${action.payload.code}`,
              message: `-`,
            });

            // break;
          }

          default: {
            if (id !== 'empty') {
              setTimeout(() => this.store.dispatch(new actions.OpenWebSocketAction()), 1000);
            }
          }
        }
      })
    );

  constructor(
    private printer: services.PrinterService,
    private actions$: Actions,
    private store: Store<interfaces.AppState>) {
  }

}
