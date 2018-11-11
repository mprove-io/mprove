import { Component, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, tap } from 'rxjs/operators';
import * as configs from 'app/configs/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';

@Component({
  selector: 'm-nav-remote-errors',
  templateUrl: 'nav-remote-errors.component.html',
  styleUrls: ['nav-remote-errors.component.scss']
})

export class NavRemoteErrorsComponent {

  projectId: string;
  projectId$ = this.store.select(selectors.getLayoutProjectId).pipe(
    filter(v => !!v),
    tap(
      x => this.projectId = x)
  );

  layoutModeIsDev$ = this.store.select(selectors.getLayoutModeIsDev); // no filter here

  remotePullAccessIsOk$ = this.store.select(selectors.getSelectedProjectDevRepoRemotePullAccessIsOk)
    .pipe(
      filter(v => !!v)
    );
  remotePushAccessIsOk$ = this.store.select(selectors.getSelectedProjectDevRepoRemotePushAccessIsOk)
    .pipe(
      filter(v => !!v)
    );

  remoteUrl$ = this.store.select(selectors.getSelectedProjectDevRepoRemoteUrl); // no filter here

  constructor(
    @Inject(configs.APP_CONFIG) public appConfig: interfaces.AppConfig,
    private store: Store<interfaces.AppState>) {
  }
}
