import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import * as actionTypes from '@app/store-actions/action-types';
import * as actions from '@app/store-actions/actions';
import * as enums from '@app/enums/_index';
import * as services from '@app/services/_index';
import * as interfaces from '@app/interfaces/_index';

@Injectable()
export class CreateFileSuccessEffect {
  @Effect({ dispatch: false }) createFileSuccess$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.CREATE_FILE_SUCCESS),
    tap((action: actions.CreateFileSuccessAction) => {
      this.store.dispatch(
        new actions.UpdateFilesStateAction([action.payload.created_dev_file])
      );
      this.store.dispatch(
        new actions.UpdateReposStateAction([action.payload.dev_repo])
      );

      this.navigateService.navigateToFileLine(
        action.payload.created_dev_file.file_id
      );
    })
    // mergeMap((action: actions.CreateFileSuccessAction) =>
    //   from([
    //     new actions.UpdateFilesStateAction([action.payload.created_dev_file]),
    //     new actions.UpdateReposStateAction([action.payload.dev_repo])
    //   ])
    // )
  );

  constructor(
    private actions$: Actions,
    private store: Store<interfaces.AppState>,
    private printer: services.PrinterService,
    private navigateService: services.NavigateService
  ) {}
}
