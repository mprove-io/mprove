import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import * as actionTypes from 'app/store/action-types';
import * as actions from 'app/store/actions/_index';
import * as enums from 'app/enums/_index';
import * as services from 'app/services/_index';

@Injectable()
export class CreateFileSuccessEffect {
  @Effect() createFileSuccess$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.CREATE_FILE_SUCCESS),
    tap((action: actions.CreateFileSuccessAction) => {
      setTimeout(() => {
        this.printer.log(
          enums.busEnum.CREATE_FILE_SUCCESS_EFFECT,
          'navigating created file...'
        );
        this.navigateService.navigateToFileLine(
          action.payload.created_dev_file.file_id
        );
      }, 1);
    }),
    mergeMap((action: actions.CreateFileSuccessAction) =>
      from([
        new actions.UpdateFilesStateAction([action.payload.created_dev_file]),
        new actions.UpdateReposStateAction([action.payload.dev_repo])
      ])
    )
  );

  constructor(
    private actions$: Actions,
    private printer: services.PrinterService,
    private navigateService: services.NavigateService
  ) {}
}
