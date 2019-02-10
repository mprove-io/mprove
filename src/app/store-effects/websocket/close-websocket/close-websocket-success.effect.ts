import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/_index';
import * as actionTypes from '@app/store-action-types/index';
import * as enums from '@app/enums/_index';
import * as interfaces from '@app/interfaces/_index';
import { MyError } from '@app/models/my-error';
import * as selectors from '@app/store/selectors/_index';
import * as services from '@app/services/_index';

@Injectable()
export class CloseWebSocketSuccessEffect {
  @Effect({ dispatch: false }) closeWebSocketSuccess$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.CLOSE_WEBSOCKET_SUCCESS),
    tap((action: actions.CloseWebSocketSuccessAction) => {
      this.printer.log(
        enums.busEnum.WEBSOCKET_EFFECTS,
        'close event object:',
        action.payload
      );

      switch (action.payload.code) {
        case 4500: {
          throw new MyError({
            name: `[WebSocketEffects] Websocket closed: ${
              action.payload.code
            } - Server: init_id is missing in url`,
            message: `-`
          });
          // break;
        }

        case 4501: {
          throw new MyError({
            name: `[WebSocketEffects] Websocket closed: ${
              action.payload.code
            } - Server: init_id not found`,
            message: `-`
          });
          // break;
        }

        case 4502: {
          throw new MyError({
            name: `[WebSocketEffects] Websocket closed: ${
              action.payload.code
            } - Server: Unanswered ping limit exceeded`,
            message: ``
          });
          // break;
        }

        case 4503: {
          // After Logout
          // OK, just closed
          break;
        }

        // case 1006: {
        //   // maintenance 1005 => 1006, 1006, 1006
        //   throw new MyError({
        //     name: `[WebSocketEffects] Websocket closed: ${action.payload.code}`,
        //     message: `-`
        //   });
        //   // break;
        // }

        default: {
          let initId: string;

          this.store
            .select(selectors.getWebSocketInitId)
            .pipe(take(1))
            .subscribe(x => {
              initId = x;
            });

          if (!!initId) {
            setTimeout(
              () => this.store.dispatch(new actions.OpenWebSocketAction()),
              1000
            );
          }
        }
      }
    })
  );

  constructor(
    private printer: services.PrinterService,
    private actions$: Actions,
    private store: Store<interfaces.AppState>
  ) {}
}
