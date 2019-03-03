import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as api from '@app/api/_index';
import * as services from '@app/services/_index';
import * as actionTypes from '@app/store-actions/action-types';
import * as helper from '@app/helper/_index';

@Injectable()
export class ConfirmFailEffect {
  @Effect() confirmFail$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.CONFIRM_FAIL),
    mergeMap((action: actions.ConfirmFailAction) => {
      return of(new actions.BackendFailAction({ error: action.payload.error }));
    })
  );

  constructor(
    private actions$: Actions,
    private myDialogService: services.MyDialogService
  ) {}
}
