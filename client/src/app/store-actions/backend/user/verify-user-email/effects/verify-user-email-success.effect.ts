import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as actionTypes from '@app/store-actions/action-types';

@Injectable()
export class VerifyUserEmailSuccessEffect {
  @Effect({ dispatch: false }) verifyUserEmailSuccess$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.VERIFY_USER_EMAIL_SUCCESS),
    tap((action: actions.VerifyUserEmailSuccessAction) => {})
  );

  constructor(private actions$: Actions) {}
}
