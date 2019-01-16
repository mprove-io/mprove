import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as services from 'app/services/_index';
import * as actionTypes from 'app/store/action-types';

@Injectable()
export class UpdateUserPasswordSuccessEffect {
  @Effect({ dispatch: false }) updateUserPasswordSuccess$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.UPDATE_USER_PASSWORD_SUCCESS),
    tap((action: actions.UpdateUserPasswordSuccessAction) => {
      this.myDialogService.showInfoDialog('New Password was set');
    })
  );

  constructor(
    private actions$: Actions,
    private myDialogService: services.MyDialogService
  ) {}
}
