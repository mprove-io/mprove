import {
  Injectable,
  type OnDestroy,
  type Signal,
  signal,
  type WritableSignal
} from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationStart,
  Router
} from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  defer,
  finalize,
  type MonoTypeOperatorFunction,
  type Observable,
  type Subscription
} from 'rxjs';
import {
  PATH_BUILDER,
  PATH_COMPLETE_REGISTRATION,
  PATH_CONFIRM_EMAIL,
  PATH_EMAIL_CONFIRMED,
  PATH_FORGOT_PASSWORD,
  PATH_LOGIN,
  PATH_NEW_PASSWORD_WAS_SET,
  PATH_NEW_SESSION,
  PATH_PASSWORD_RESET_SENT,
  PATH_REGISTER,
  PATH_SELECT_FILE,
  PATH_UPDATE_PASSWORD,
  PATH_USER_DELETED,
  PATH_VERIFY_EMAIL
} from '#common/constants/top';
import {
  APP_SPINNER_NAME,
  MIN_TIME_TO_SPIN
} from '#common/constants/top-front';

@Injectable({ providedIn: 'root' })
export class AppSpinnerService implements OnDestroy {
  private visible: WritableSignal<boolean> = signal(false);

  readonly isVisible: Signal<boolean> = this.visible.asReadonly();

  private operationCount = 0;

  private navigationIds: Set<number> = new Set<number>();

  private startedTs = 0;

  private isDestroyed = false;

  private visibilityTimer?: ReturnType<typeof setTimeout>;

  private navigationSubscription: Subscription;

  constructor(
    private router: Router,
    private spinner: NgxSpinnerService
  ) {
    this.navigationSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (
          this.shouldShowNavigation({
            startUrl: this.router.url,
            endUrl: event.url
          })
        ) {
          this.navigationIds.add(event.id);
        }

        this.updateVisibility();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError ||
        event instanceof NavigationSkipped
      ) {
        this.navigationIds.delete(event.id);

        this.updateVisibility();
      }
    });
  }

  /** Each subscription owns only its work, never another request or navigation. */
  track<T>(): MonoTypeOperatorFunction<T> {
    let operator: MonoTypeOperatorFunction<T> = source =>
      defer(() => {
        this.operationCount++;

        this.updateVisibility();

        let response: Observable<T> = source.pipe(
          finalize(() => {
            this.operationCount--;

            this.updateVisibility();
          })
        );

        return response;
      });

    return operator;
  }

  private updateVisibility(): void {
    if (this.isDestroyed) {
      return;
    }

    clearTimeout(this.visibilityTimer);

    if (this.operationCount > 0 || this.navigationIds.size > 0) {
      if (this.visible() === false) {
        // A child may start work during initialization, after the root view was
        // checked. Update the rendered indicator on the next turn instead.
        this.visibilityTimer = setTimeout(() => {
          this.startedTs = Date.now();

          this.visible.set(true);

          void this.spinner.show(APP_SPINNER_NAME);
        }, 0);
      }

      return;
    }

    if (this.visible() === false) {
      return;
    }

    let remainingMs: number = Math.max(
      MIN_TIME_TO_SPIN - (Date.now() - this.startedTs),
      0
    );

    // Defer even a zero-duration hide so redirects and request-to-route handoffs
    // can acquire ownership without briefly hiding the shared spinner.
    this.visibilityTimer = setTimeout(() => {
      if (this.operationCount === 0 && this.navigationIds.size === 0) {
        this.visible.set(false);

        void this.spinner.hide(APP_SPINNER_NAME);
      }
    }, remainingMs);
  }

  private shouldShowNavigation(item: {
    startUrl: string;
    endUrl: string;
  }): boolean {
    let { startUrl, endUrl } = item;

    let startPath: string = startUrl.split('?')[0];

    let endPath: string = endUrl.split('?')[0];

    let builderSegment = `/${PATH_BUILDER}/`;

    let startIndex: number = startPath.indexOf(builderSegment);

    let endIndex: number = endPath.indexOf(builderSegment);

    let endLastSegment: string = endPath.split('/').pop();

    if (
      startIndex >= 0 &&
      endIndex >= 0 &&
      startPath.substring(0, startIndex) === endPath.substring(0, endIndex) &&
      (endLastSegment === PATH_SELECT_FILE ||
        endLastSegment === PATH_NEW_SESSION)
    ) {
      return false;
    }

    let excludedPaths: string[] = [
      PATH_REGISTER,
      PATH_VERIFY_EMAIL,
      PATH_CONFIRM_EMAIL,
      PATH_EMAIL_CONFIRMED,
      PATH_COMPLETE_REGISTRATION,
      PATH_LOGIN,
      PATH_USER_DELETED,
      PATH_FORGOT_PASSWORD,
      PATH_PASSWORD_RESET_SENT,
      PATH_UPDATE_PASSWORD,
      PATH_NEW_PASSWORD_WAS_SET
    ];

    let isExcludedPath: boolean = excludedPaths.includes(endPath.split('/')[1]);

    return isExcludedPath === false;
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;

    this.navigationSubscription.unsubscribe();

    clearTimeout(this.visibilityTimer);

    if (this.visible()) {
      this.visible.set(false);

      void this.spinner.hide(APP_SPINNER_NAME);
    }
  }
}
