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
export class WatchAuthenticationService {
  private userId: string;

  private readonly LOGOUT_URL: string = '/logout';
  private readonly PROFILE_URL: string = '/profile';

  private checkAuthSub: Subscription = null;

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
    this.store
      .select(selectors.getUserLoaded)
      .pipe(filter(v => !!v && !this.isRunning))
      .subscribe(() => this.start());
  }

  start(): void {
    this.isRunning = true;
    this.printer.log(enums.busEnum.WATCH_AUTHENTICATION_SERVICE, 'start');

    this.store.select(selectors.getUserId).subscribe(x => {
      this.userId = x;
    });

    if (this.checkAuthSub === null) {
      this.checkAuthSub = observableInterval(2000).subscribe(() => {
        this.printer.log(
          enums.busEnum.WATCH_AUTHENTICATION_SERVICE,
          '----------CHECK------------'
        );

        // authenticated
        if (this.auth.authenticated()) {
          this.printer.log(
            enums.busEnum.WATCH_AUTHENTICATION_SERVICE,
            'authenticated'
          );

          if (this.userId === undefined) {
            throw new MyError({
              name: `[DoCheckAuthService] User ID is undefined`,
              message: `-`
            });
          }

          this.printer.log(
            enums.busEnum.WATCH_AUTHENTICATION_SERVICE,
            'UserId:',
            this.userId
          );

          let tokenEmail = this.stateResolver.getTokenEmail();

          this.printer.log(
            enums.busEnum.WATCH_AUTHENTICATION_SERVICE,
            'tokenEmail:',
            tokenEmail
          );

          if (this.userId !== tokenEmail) {
            throw new MyError({
              name: `[DoCheckAuthService] User ID is mismatch`,
              message: `-`
            });
          } else {
            this.printer.log(
              enums.busEnum.WATCH_AUTHENTICATION_SERVICE,
              'authenticated, user_id match, complete'
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
              enums.busEnum.WATCH_AUTHENTICATION_SERVICE,
              'not authenticated, protected url, dispatching Logout...'
            );
            this.store.dispatch(new actions.LogoutUserAction({ empty: true }));
          }

          return;
        }
      });
    }
  }

  stop(): void {
    this.printer.log(enums.busEnum.WATCH_AUTHENTICATION_SERVICE, 'stop');
    this.isRunning = false;
    if (this.checkAuthSub) {
      this.checkAuthSub.unsubscribe();
    }
    this.checkAuthSub = null;
  }
}
