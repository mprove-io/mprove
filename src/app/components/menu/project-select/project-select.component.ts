import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, map } from 'rxjs/operators';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';
import * as services from 'app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-project-select',
  templateUrl: 'project-select.component.html',
  styleUrls: ['./project-select.component.scss'],
})
export class ProjectSelectComponent {

  layoutProjectId$ = this.store.select(selectors.getLayoutProjectId)
    .pipe(
      filter(v => !!v)
    );

  projectsIds$ = this.store.select(selectors.getProjectsNotDeletedIds)
    .pipe(
      map(
        projectIds => projectIds.sort(
          (a, b) => {
            let nameA = a.toLowerCase();
            let nameB = b.toLowerCase();
            if (nameA < nameB) { // sort string ascending
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
            return 0; // default return value (no sorting)
          }
        )
      )); // no filter here

  constructor(
    private store: Store<interfaces.AppState>,
    private myDialogService: services.MyDialogService,
  ) {

  }

  openNewProjectDialog() {
    this.myDialogService.showNewProjectDialog();
  }
}
