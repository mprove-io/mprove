import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as interfaces from 'app/interfaces/_index';

@Injectable()
export class RouterEffect {
  constructor(
    private router: Router,
    private store: Store<interfaces.AppState>
  ) {
    this.listenToRouter();
  }

  // CHANGE_ROUTER_URL used in segmentMetaReducer

  private listenToRouter() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.store.dispatch(new actions.ChangeRouterUrlAction(event.url));
      });
  }
}
