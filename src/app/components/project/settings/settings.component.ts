import { Component, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';
import * as services from 'app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})

export class SettingsComponent implements OnDestroy {

  selectedProjectUserIsAdmin$ = this.store.select(selectors.getSelectedProjectUserIsAdmin);

  selectedProject$ = this.store.select(selectors.getSelectedProject).pipe(filter(v => !!v));
  selectedProjectId$ = this.store.select(selectors.getSelectedProjectId).pipe(filter(v => !!v));
  selectedProjectBqProject$ = this.store.select(selectors.getSelectedProjectBqProject).pipe(filter(v => !!v));
  selectedProjectClientEmail$ = this.store.select(selectors.getSelectedProjectClientEmail).pipe(filter(v => !!v));

  pageTitleSub: Subscription;

  constructor(
    private store: Store<interfaces.AppState>,
    private pageTitle: services.PageTitleService,
    private myDialogService: services.MyDialogService,
  ) {
    this.pageTitleSub = this.pageTitle.setProjectSubtitle('Settings');
  }

  ngOnDestroy() {
    this.pageTitleSub.unsubscribe();
  }

  openUpdateCredentialsDialog() {
    this.myDialogService.showUpdateCredentialsDialog();
  }

  openDeleteProjectDialog() {
    this.myDialogService.showDeleteProjectDialog();
  }
}
