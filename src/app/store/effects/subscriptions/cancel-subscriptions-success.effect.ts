import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';

@Injectable()
export class CancelSubscriptionsSuccessEffect {

  @Effect() cancelSubscriptionsSuccess$: Observable<Action> = this.actions$
    .ofType(actionTypes.CANCEL_SUBSCRIPTIONS_SUCCESS)
    .pipe(
      mergeMap((action: actions.CancelSubscriptionsSuccessAction) => from([
        new actions.UpdateSubscriptionsStateAction(action.payload.subscriptions),
        new actions.UpdateProjectsStateAction([action.payload.project]),
      ])
      )
    );

  constructor(
    private actions$: Actions) {
  }
}
