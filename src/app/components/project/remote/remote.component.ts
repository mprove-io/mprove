import { Component, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { interval, Subscription } from 'rxjs';
import { filter, map, startWith, take, tap } from 'rxjs/operators';
import * as actions from '@app/store/actions/_index';
import * as api from '@app/api/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store/selectors/_index';
import * as services from '@app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-remote',
  templateUrl: 'remote.component.html',
  styleUrls: ['remote.component.scss']
})
export class RemoteComponent implements OnDestroy {
  remoteUrl$ = this.store.select(selectors.getSelectedProjectDevRepoRemoteUrl); // no filter here

  remoteWebhook$ = this.store.select(
    selectors.getSelectedProjectDevRepoRemoteWebhook
  ); // no filter here

  remotePublicKey$ = this.store.select(
    selectors.getSelectedProjectDevRepoRemotePublicKey
  ); // no filter here

  remotePushAccessIsOk$ = this.store
    .select(selectors.getSelectedProjectDevRepoRemotePushAccessIsOk)
    .pipe(filter(v => !!v));

  remotePushErrorMessage$ = this.store.select(
    selectors.getSelectedProjectDevRepoRemotePushErrorMessage
  ); // no filter here

  remoteNeedManualPull$ = this.store
    .select(selectors.getSelectedProjectDevRepoRemoteNeedManualPull)
    .pipe(filter(v => !!v));

  remotePullAccessIsOk$ = this.store
    .select(selectors.getSelectedProjectDevRepoRemotePullAccessIsOk)
    .pipe(filter(v => !!v));

  remotePullErrorMessage$ = this.store.select(
    selectors.getSelectedProjectDevRepoRemotePullErrorMessage
  ); // no filter here

  remoteLastPullTs: number;
  remoteLastPullTs$ = this.store
    .select(selectors.getSelectedProjectDevRepoRemoteLastPullTs)
    .pipe(
      filter(v => !!v),
      tap(x => (this.remoteLastPullTs = x))
    );

  remoteLastPushTs: number;
  remoteLastPushTs$ = this.store
    .select(selectors.getSelectedProjectDevRepoRemoteLastPushTs)
    .pipe(
      filter(v => !!v),
      tap(x => (this.remoteLastPushTs = x))
    );

  lastPullTimeAgo$ = interval(1000).pipe(
    startWith(0),
    map(x => {
      if (this.remoteLastPullTs > 1) {
        return this.timeService.timeAgoFromNow(this.remoteLastPullTs);
      } else {
        return 'never';
      }
    })
  );

  lastPushTimeAgo$ = interval(1000).pipe(
    startWith(0),
    map(x => {
      if (this.remoteLastPushTs > 1) {
        return this.timeService.timeAgoFromNow(this.remoteLastPushTs);
      } else {
        return 'never';
      }
    })
  );

  selectedProjectId$ = this.store
    .select(selectors.getSelectedProjectId)
    .pipe(filter(v => !!v));

  titlePageSub: Subscription;

  constructor(
    private store: Store<interfaces.AppState>,
    private myDialogService: services.MyDialogService,
    private pageTitleService: services.PageTitleService,
    private timeService: services.TimeService
  ) {
    this.titlePageSub = this.pageTitleService.setProjectSubtitle('Remote');
  }

  ngOnDestroy() {
    this.titlePageSub.unsubscribe();
  }

  openUpdateRemoteUrlDialog() {
    this.myDialogService.showUpdateRemoteUrlDialog();
  }

  regenerateRemoteWebhook() {
    let devRepo: api.Repo;
    this.store
      .select(selectors.getSelectedProjectDevRepo)
      .pipe(take(1))
      .subscribe(x => (devRepo = x));

    this.store.dispatch(
      new actions.RegenerateRepoRemoteWebhookAction({
        project_id: devRepo.project_id,
        repo_id: devRepo.repo_id,
        server_ts: devRepo.server_ts
      })
    );
  }

  regenerateRemotePublicKey() {
    let devRepo: api.Repo;
    this.store
      .select(selectors.getSelectedProjectDevRepo)
      .pipe(take(1))
      .subscribe(x => (devRepo = x));

    this.store.dispatch(
      new actions.RegenerateRepoRemotePublicKeyAction({
        project_id: devRepo.project_id,
        repo_id: devRepo.repo_id,
        server_ts: devRepo.server_ts
      })
    );
  }
}
