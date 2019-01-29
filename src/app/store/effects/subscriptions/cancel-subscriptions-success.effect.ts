import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from '@app/store/actions/_index';
import * as actionTypes from '@app/store/action-types';

@Injectable()
export class CancelSubscriptionsSuccessEffect {
  @Effect() cancelSubscriptionsSuccess$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.CANCEL_SUBSCRIPTIONS_SUCCESS),
    mergeMap((action: actions.CancelSubscriptionsSuccessAction) =>
      from([
        new actions.UpdateSubscriptionsStateAction(
          action.payload.subscriptions
        ),
        new actions.UpdateProjectsStateAction([action.payload.project])
      ])
    )
  );

  constructor(private actions$: Actions) {}
}
