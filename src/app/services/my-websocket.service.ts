import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { NextObserver, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { webSocket, WebSocketSubjectConfig } from 'rxjs/webSocket';
import * as actions from '@app/store-actions/actions';
import * as api from '@app/api/_index';
import * as configs from '@app/configs/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store-selectors/_index';
import { MyError } from '@app/models/my-error';
import { WatchWebsocketService } from './watch-websocket.service';

@Injectable()
export class MyWebSocketService {
  protected basePath = configs.pathConfig.websocketUrl;

  protected websocketSubscription: Subscription;

  constructor(
    private store: Store<interfaces.AppState>,
    private watchWebsocketService: WatchWebsocketService
  ) {}

  close() {
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
  }

  open() {
    let initId: string;

    this.store
      .select(selectors.getWebSocketInitId)
      .pipe(take(1))
      .subscribe(x => {
        initId = x;
      });

    if (!initId) {
      return;
    }

    let fullPath = this.basePath + initId;

    let openObserver: NextObserver<Event> = {
      next: () => this.store.dispatch(new actions.OpenWebSocketSuccessAction())
    };

    let closeObserver: NextObserver<CloseEvent> = {
      next: p => {
        this.watchWebsocketService.stop();

        let closeInitId: string;

        this.store
          .select(selectors.getWebSocketInitId)
          .pipe(take(1))
          .subscribe(x => {
            closeInitId = x;
          });

        let wsIsOpen: boolean = false;

        this.store
          .select(selectors.getWebSocketIsOpen)
          .pipe(take(1))
          .subscribe(isOpen => {
            wsIsOpen = isOpen;
          });

        if (wsIsOpen || !closeInitId) {
          this.store.dispatch(new actions.CloseWebSocketSuccessAction(p));
        } else {
          throw new MyError({
            name: `[MyWebSocketService] connect failed`,
            message: '-'
          });
        }
      }
    };

    let config: WebSocketSubjectConfig<any> = {
      url: fullPath,
      openObserver: openObserver,
      closeObserver: closeObserver
    };

    const subject = webSocket(config);

    this.websocketSubscription = subject.subscribe(
      (x: any) => {
        switch (x.info.action) {
          case api.ServerRequestToClientActionEnum.Ping: {
            this.store.dispatch(new actions.PingReceivedAction(x));
            // nothing to do here...
            break;
          }

          case api.ServerRequestToClientActionEnum.StateUpdate: {
            this.store.dispatch(new actions.StateReceivedAction(x));
            this.store.dispatch(new actions.UpdateStateAction(x.payload));
            break;
          }

          default: {
          }
        }
      },

      err => {
        // if (!err.data) {
        //   err.name = `[WebsocketService] ${err.message}`;
        //   err.message = `[WebsocketService] ${err.message}: -`;

        //   err.data = {
        //     name: err.name,
        //     message: '-'
        //   };
        // }

        console.log(err);
      }
    );
  }
}
