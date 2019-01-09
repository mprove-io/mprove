import { Inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { interval as observableInterval, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as configs from 'app/configs/_index';
import * as enums from 'app/enums/_index';
import * as interfaces from 'app/interfaces/_index';
import { MyError } from 'app/models/my-error';
import * as selectors from 'app/store/selectors/_index';
import { PrinterService } from 'app/services/printer.service';

@Injectable()
export class WatchWebsocketService {
  private isRunning: boolean = false;
  private lastTs: number;

  private checkLastWsMsgTsSub: Subscription = null;

  constructor(
    @Inject(configs.APP_CONFIG) public appConfig: interfaces.AppConfig,
    private store: Store<interfaces.AppState>,
    private printer: PrinterService
  ) {
    this.store
      .select(selectors.getUserLoaded)
      .pipe(filter(v => !!v && !this.isRunning))
      .subscribe(() => this.start());
  }

  start(): void {
    this.isRunning = true;

    this.lastTs = null;

    this.printer.log(enums.busEnum.WATCH_WEBSOCKET_SERVICE, 'start');

    if (this.checkLastWsMsgTsSub === null) {
      this.checkLastWsMsgTsSub = observableInterval(2000).subscribe(() => {
        this.printer.log(
          enums.busEnum.WATCH_WEBSOCKET_SERVICE,
          '----------CHECK------------'
        );

        this.store
          .select(selectors.getLayoutLastWsMsgTs)
          .pipe(filter(v => !!v))
          .subscribe(x => {
            this.lastTs = x;
          });

        if (this.lastTs) {
          let currentTs = Date.now();

          const diff = Math.round((currentTs - this.lastTs) / 1000);

          this.printer.log(
            enums.busEnum.WATCH_WEBSOCKET_SERVICE,
            'ping timestamp difference:',
            `${diff}s`
          );

          if (diff > 600) {
            // TODO: #22 change 10 min to 30 sec and message to 'connection lost'

            throw new MyError({
              name: `[DoCheckWebsocketService] Ping expired`,
              message: `-`
            });
          }
        }
      });
    }
  }

  stop(): void {
    this.printer.log(enums.busEnum.WATCH_WEBSOCKET_SERVICE, 'stop');
    this.isRunning = false;
    if (this.checkLastWsMsgTsSub) {
      this.checkLastWsMsgTsSub.unsubscribe();
    }
    this.checkLastWsMsgTsSub = null;
  }
}
