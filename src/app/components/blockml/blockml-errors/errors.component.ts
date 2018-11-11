import { Component } from '@angular/core';
import { StepState } from '@covalent/core';
import { Store } from '@ngrx/store';
import { filter, map } from 'rxjs/operators';
import * as api from 'src/app/api/_index';
import * as interfaces from 'src/app/interfaces/_index';
import * as selectors from 'src/app/store/selectors/_index';
import * as services from 'src/app/services/_index';
import { ExtensionPipe } from 'src/app/pipes/extension.pipe';

@Component({
  moduleId: module.id,
  selector: 'm-errors',
  templateUrl: 'errors.component.html',
  styleUrls: ['errors.component.scss'],
})

export class ErrorsComponent {
  errorType = Symbol('BlockMlErrorType');
  sortOrder = Symbol('BlockMlErrorSortOrder');
  stateStep: StepState = StepState.Required;

  errors$ = this.store.select(selectors.getSelectedProjectModeRepoErrors)
    .pipe(
      filter(v => !!v),
      map(errorList =>
        errorList.map(error => {
          let errorType = this.extension.transform(error.lines[0].file_id);
          return Object.assign({}, error, {
            [this.errorType]: errorType[0].toUpperCase() + errorType.slice(1),
            [this.sortOrder]: this.errorSortOrder(errorType)
          });
        }).sort((a, b) => {
          if (a[<any>this.sortOrder] < b[<any>this.sortOrder]) {
            return -1;
          } else if (a[<any>this.sortOrder] > b[<any>this.sortOrder]) {
            return 1;
          } else {
            return 0;
          }
        })
      )
    );

  constructor(
    private store: Store<interfaces.AppState>,
    private navigateService: services.NavigateService,
    private extension: ExtensionPipe) {
  }

  errorSortOrder(errorType: string): number {
    switch (errorType) {
      case 'other': return 1;
      case 'udf': return 2;
      case 'view': return 3;
      case 'model': return 4;
      case 'dashboard': return 5;
      default: return 0;
    }
  }

  lineOnClick(line: api.FileLine) {
    this.navigateService.navigateToFileLine(line.file_id, line.line_number);
  }

}
