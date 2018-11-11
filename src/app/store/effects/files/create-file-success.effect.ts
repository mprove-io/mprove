import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import * as actionTypes from 'src/app/store/action-types';
import * as actions from 'src/app/store/actions/_index';
import * as enums from 'src/app/enums/_index';
import * as services from 'src/app/services/_index';

@Injectable()
export class CreateFileSuccessEffect {

  @Effect() createFileSuccess$: Observable<Action> = this.actions$
    .ofType(actionTypes.CREATE_FILE_SUCCESS)
    .pipe(
      tap((action: actions.CreateFileSuccessAction) => {
        setTimeout(
          () => {
            this.printer.log(enums.busEnum.CREATE_FILE_SUCCESS_EFFECT, 'navigating created file...');
            this.navigateService.navigateToFileLine(action.payload.created_dev_file.file_id);
          },
          1);
      }),
      mergeMap((action: actions.CreateFileSuccessAction) => from([
        new actions.UpdateFilesStateAction([action.payload.created_dev_file]),
        new actions.UpdateReposStateAction([action.payload.dev_repo]),
      ])
      )
    );

  constructor(
    private actions$: Actions,
    private printer: services.PrinterService,
    private navigateService: services.NavigateService) {
  }

}
