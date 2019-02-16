import { Component } from '@angular/core';
import { StepState } from '@covalent/core';
import { Store } from '@ngrx/store';
import { filter, map } from 'rxjs/operators';
import * as api from '@app/api/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store-selectors/_index';
import * as services from '@app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-conflicts',
  templateUrl: 'conflicts.component.html',
  styleUrls: ['conflicts.component.scss']
})
export class ConflictsComponent {
  conflicts$ = this.store
    .select(selectors.getSelectedProjectModeRepoConflicts)
    .pipe(filter(v => !!v));

  constructor(
    private store: Store<interfaces.AppState>,
    private navigateService: services.NavigateService
  ) {}

  conflictLineClick(line: api.FileLine) {
    this.navigateService.navigateToFileLine(line.file_id, line.line_number);
  }
}
