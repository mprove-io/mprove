import { Location } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { interval as observableInterval, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as configs from 'app/configs/_index';
import * as enums from 'app/enums/_index';
import * as interfaces from 'app/interfaces/_index';
import { MyError } from 'app/models/my-error';
import * as selectors from 'app/store/selectors/_index';
import { PrinterService } from 'app/services/printer.service';
import { AuthService } from 'app/services/auth.service';
import { StateResolver } from 'app/resolvers/state.resolver';

@Injectable()
export class DoCheckService {
  private userId: string;
  private lastTs: number;

  private readonly LOGOUT_URL: string = '/logout';
  private readonly PROFILE_URL: string = '/profile';

  private checkAuthSub: Subscription = null;
  private checkLastWsMsgTsSub: Subscription = null;

  private isRunning: boolean = false;

  constructor(
    @Inject(configs.APP_CONFIG) public appConfig: interfaces.AppConfig,
    private location: Location,
    private store: Store<interfaces.AppState>,
    private printer: PrinterService,
    private router: Router,
    private stateResolver: StateResolver,
    private auth: AuthService
  ) {
    this.store.select(selectors.getUserId).subscribe(x => {
      this.userId = x;
      this.printer.log(enums.busEnum.DO_CHECK_SERVICE, 'UserId:', this.userId);
    });

    this.auth
      .getLockAuthenticated()
      .subscribe(() => this.stopWatchAuthentication());

    this.store
      .select(selectors.getUserLoaded)
      .pipe(filter(v => !!v && !this.isRunning))
      .subscribe(() => this.startWatchAuthentication());
  }

  startCheck(): void {
    this.startWatchAuthentication();
    this.startWatchWebSocketMessage();
  }

  stopCheck(): void {
    this.stopWatchAuthentication();
    this.stopWatchWebSocketMessage();
  }

  private startWatchAuthentication(): void {
    this.isRunning = true;
    this.printer.log(
      enums.busEnum.DO_CHECK_SERVICE,
      'start watch: authentication'
    );

    if (this.checkAuthSub === null) {
      this.checkAuthSub = observableInterval(2000).subscribe(() => {
        this.printer.log(
          enums.busEnum.DO_CHECK_SERVICE,
          '----------CHECK------------'
        );

        // authenticated
        if (this.auth.authenticated()) {
          this.printer.log(enums.busEnum.DO_CHECK_SERVICE, 'authenticated');

          if (this.userId === undefined) {
            this.printer.log(
              enums.busEnum.DO_CHECK_SERVICE,
              'user_id undefined, reloading location...'
            );

            if (this.appConfig.forceWindowReload) {
              window.location.reload();
              return;
            }

            throw new MyError({
              name: `[DoCheckService] User ID is undefined`,
              message: `-`
            });

            // this.stopCheck();
            // return;
          }

          let tokenEmail = this.stateResolver.getTokenEmail();
          this.printer.log(
            enums.busEnum.DO_CHECK_SERVICE,
            'tokenEmail:',
            tokenEmail
          );

          if (this.userId !== tokenEmail) {
            this.printer.log(
              enums.busEnum.DO_CHECK_SERVICE,
              'user_id mismatch, reloading location...'
            );

            if (this.appConfig.forceWindowReload) {
              window.location.reload();
              return;
            }

            throw new MyError({
              name: `[DoCheckService] User ID is mismatch`,
              message: `-`
            });

            // this.stopCheck();
            // return;
          } else {
            this.printer.log(
              enums.busEnum.DO_CHECK_SERVICE,
              'user_id match, complete'
            );

            if (this.location.path() === this.LOGOUT_URL) {
              this.router.navigateByUrl(this.PROFILE_URL);
            }

            return;
          }

          // not authenticated
        } else {
          let pathArray = this.location.path().split('/');

          if (
            ['profile', 'project', 'project-deleted'].indexOf(pathArray[0]) > -1
          ) {
            this.printer.log(
              enums.busEnum.DO_CHECK_SERVICE,
              'not authenticated,  dispatching Logout...'
            );
            this.store.dispatch(new actions.LogoutUserAction({ empty: true }));
          }

          return;
        }
      });
    }
  }

  private stopWatchAuthentication(): void {
    this.isRunning = false;
    if (this.checkAuthSub) {
      this.checkAuthSub.unsubscribe();
    }
    this.checkAuthSub = null;
  }

  private startWatchWebSocketMessage(): void {
    this.printer.log(
      enums.busEnum.DO_CHECK_SERVICE,
      'start watch: websocket message timestamp'
    );

    this.lastTs = null;

    if (this.checkLastWsMsgTsSub === null) {
      this.checkLastWsMsgTsSub = this.store
        .select(selectors.getLayoutLastWsMsgTs)
        .pipe(filter(v => !!v))
        .subscribe(currentTs => {
          if (this.lastTs) {
            const diff = Math.round((currentTs - this.lastTs) / 1000);

            this.printer.log(
              enums.busEnum.DO_CHECK_SERVICE,
              'ping timestamp difference:',
              `${diff}s`
            );

            if (diff > 600) {
              // TODO: change 10 min to 30 sec and message to 'connection lost'

              if (this.appConfig.forceWindowReload) {
                window.location.reload();
                return;
              }

              throw new MyError({
                name: `[DoCheckService] Ping expired`,
                message: `-`
              });

              // this.stopWatchWebSocketMessage(); // stop listening timestamps
            }
          }

          this.lastTs = currentTs;
        });
    }
  }

  private stopWatchWebSocketMessage(): void {
    if (this.checkLastWsMsgTsSub) {
      this.checkLastWsMsgTsSub.unsubscribe();
    }
    this.checkLastWsMsgTsSub = null;
  }
}
