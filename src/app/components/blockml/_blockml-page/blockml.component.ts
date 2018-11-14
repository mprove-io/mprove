import { Component, OnDestroy, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as api from 'app/api/_index';
import * as enums from 'app/enums/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';
import * as services from 'app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-repo',
  templateUrl: 'blockml.component.html',
  styleUrls: ['blockml.component.scss']
})
export class BlockMLComponent implements OnDestroy {
  @ViewChild('sidenav') sidenav: MatSidenav;
  @ViewChild('sidenavRight') sidenavRight: MatSidenav;

  remotePageIsActive$ = this.store.select(selectors.getRouterPath).pipe(
    filter(v => !!v),
    map(
      path => path.split('/').findIndex(element => element === 'remote') === 6
    )
  );

  projectId: string;
  projectId$ = this.store.select(selectors.getLayoutProjectId).pipe(
    filter(v => !!v),
    tap(x => (this.projectId = x))
  );

  mode: enums.LayoutModeEnum;
  mode$ = this.store.select(selectors.getLayoutMode).pipe(
    filter(v => !!v),
    tap(x => (this.mode = x))
  );

  repoId: string;
  repoId$ = this.store.select(selectors.getSelectedProjectModeRepoId).pipe(
    filter(v => !!v),
    tap(x => (this.repoId = x))
  );

  canPush$ = this.store.select(selectors.getCanPush);

  repoServerTs: number;
  repoServerTs$ = this.store
    .select(selectors.getSelectedProjectModeRepoServerTs)
    .pipe(
      filter(v => !!v),
      tap(x => (this.repoServerTs = x))
    );

  conflicts$ = this.store
    .select(selectors.getSelectedProjectModeRepoConflicts)
    .pipe(filter(v => !!v));
  conflictsLength$ = this.store
    .select(selectors.getSelectedProjectModeRepoConflictsLength)
    .pipe(filter(v => !!v));

  fileIsNotSelected$ = this.store
    .select(selectors.getSelectedProjectModeRepoFile)
    .pipe(map(x => !x)); // no filter here
  errorsExist$ = this.store.select(
    selectors.getSelectedProjectModeRepoErrorsExist
  ); // no filter here;
  needSave$ = this.store.select(selectors.getLayoutNeedSave); // no filter here
  isDev$ = this.store.select(selectors.getLayoutModeIsDev); // no filter here

  repoIsNeedResolve$ = this.store.select(
    selectors.getSelectedProjectModeRepoIsNeedResolve
  ); // no filter here
  repoIsNeedCommit$ = this.store.select(
    selectors.getSelectedProjectModeRepoIsNeedCommit
  ); // no filter here
  repoIsNeedPull$ = this.store.select(
    selectors.getSelectedProjectModeRepoIsNeedPull
  ); // no filter here
  repoIsNeedPush$ = this.store.select(
    selectors.getSelectedProjectModeRepoIsNeedPush
  ); // no filter here
  repoIsOk$ = this.store.select(selectors.getSelectedProjectModeRepoIsOk); // no filter here

  repoRemoteNeedManualPull$ = this.store.select(
    selectors.getSelectedProjectDevRepoRemoteNeedManualPull
  ); // no filter here

  pageTitleSub: Subscription;

  constructor(
    private printer: services.PrinterService,
    private store: Store<interfaces.AppState>,
    private navigateService: services.NavigateService,
    private pageTitle: services.PageTitleService
  ) {
    this.pageTitleSub = this.pageTitle.setProjectSubtitle('BlockML');
  }

  ngOnDestroy() {
    this.pageTitleSub.unsubscribe();
  }

  conflictLineClick(line: api.FileLine) {
    this.navigateService.navigateToFileLine(line.file_id, line.line_number);
  }

  commit() {
    this.store.dispatch(
      new actions.CommitRepoAction({
        project_id: this.projectId,
        repo_id: this.repoId,
        server_ts: this.repoServerTs
      })
    );
  }

  pull() {
    this.store.dispatch(
      new actions.PullRepoAction({
        project_id: this.projectId,
        repo_id: this.repoId,
        server_ts: this.repoServerTs,
        from_remote: false
      })
    );
  }

  pullFromRemote() {
    this.store.dispatch(
      new actions.PullRepoAction({
        project_id: this.projectId,
        repo_id: this.repoId,
        server_ts: this.repoServerTs,
        from_remote: true
      })
    );
  }

  push() {
    this.store.dispatch(
      new actions.PushRepoAction({
        project_id: this.projectId,
        repo_id: this.repoId,
        server_ts: this.repoServerTs
      })
    );
  }

  revertRepoToLastCommit() {
    this.store.dispatch(
      new actions.RevertRepoToLastCommitAction({
        project_id: this.projectId,
        repo_id: this.repoId,
        server_ts: this.repoServerTs
      })
    );
  }

  revertRepoToProduction() {
    this.store.dispatch(
      new actions.RevertRepoToProductionAction({
        project_id: this.projectId,
        repo_id: this.repoId,
        server_ts: this.repoServerTs
      })
    );
  }

  close() {
    this.sidenav.close();
  }

  closeRight() {
    this.sidenavRight.close();
  }

  activateEvent(event: any) {
    this.printer.log(
      enums.busEnum.ACTIVATE_EVENT,
      'from BlockMLComponent:',
      event
    );
  }

  deactivateEvent(event: any) {
    this.printer.log(
      enums.busEnum.DEACTIVATE_EVENT,
      'from BlockMLComponent:',
      event
    );
  }
}
