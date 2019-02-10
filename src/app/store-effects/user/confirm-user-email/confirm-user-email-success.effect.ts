import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/_index';
import * as services from '@app/services/_index';
import * as actionTypes from '@app/store-action-types/index';

@Injectable()
export class ConfirmUserEmailSuccessEffect {
  @Effect({ dispatch: false }) confirmUserEmailSuccess$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.CONFIRM_USER_EMAIL_SUCCESS),
    tap((action: actions.ConfirmUserEmailSuccessAction) => {
      this.myDialogService.showInfoDialog('Email is confirmed');
    })
  );

  constructor(
    private actions$: Actions,
    private myDialogService: services.MyDialogService
  ) {}
}
