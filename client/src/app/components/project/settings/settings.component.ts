import { Component, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store-selectors/_index';
import * as services from '@app/services/_index';
import * as api from '@app/api/_index';

@Component({
  moduleId: module.id,
  selector: 'm-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnDestroy {
  projectConnectionEnum = api.ProjectConnectionEnum;

  selectedProjectUserIsAdmin$ = this.store.select(
    selectors.getSelectedProjectUserIsAdmin
  );

  selectedProjectId$ = this.store
    .select(selectors.getSelectedProjectId)
    .pipe(filter(v => !!v));

  projectConnection;
  selectedProjectConnection$ = this.store
    .select(selectors.getSelectedProjectConnection)
    .pipe(
      // no filter here
      tap(x => {
        this.projectConnection = x;
      })
    );

  selectedProjectBqProject$ = this.store.select(
    selectors.getSelectedProjectBqProject
  );

  selectedProjectClientEmail$ = this.store.select(
    selectors.getSelectedProjectClientEmail
  );

  postgresHost$ = this.store.select(selectors.getSelectedProjectPostgresHost);

  postgresPort$ = this.store.select(selectors.getSelectedProjectPostgresPort);

  postgresDatabase$ = this.store.select(
    selectors.getSelectedProjectPostgresDatabase
  );

  postgresUser$ = this.store.select(selectors.getSelectedProjectPostgresUser);

  pageTitleSub: Subscription;

  constructor(
    private store: Store<interfaces.AppState>,
    private pageTitle: services.PageTitleService,
    private myDialogService: services.MyDialogService
  ) {
    this.pageTitleSub = this.pageTitle.setProjectSubtitle('Settings');
  }

  ngOnDestroy() {
    this.pageTitleSub.unsubscribe();
  }

  openUpdateCredentialsDialog() {
    if (this.projectConnection === api.ProjectConnectionEnum.BigQuery) {
      this.myDialogService.showUpdateCredentialsDialog();
    } else if (
      this.projectConnection === api.ProjectConnectionEnum.PostgreSQL
    ) {
      this.myDialogService.showUpdateCredentialsPostgresDialog();
    }
  }

  openDeleteProjectDialog() {
    this.myDialogService.showDeleteProjectDialog();
  }
}
