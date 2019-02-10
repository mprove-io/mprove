import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from '@app/store-actions/_index';
import * as actionTypes from '@app/store-action-types/index';

@Injectable()
export class SwitchAnalyticsSubscriptionPlanSuccessEffect {
  @Effect() switchAnalyticsSubscriptionPlanSuccess$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.SWITCH_ANALYTICS_SUBSCRIPTION_PLAN_SUCCESS),
    mergeMap((action: actions.SwitchAnalyticsSubscriptionPlanSuccessAction) =>
      from([
        new actions.UpdateSubscriptionsStateAction([
          action.payload.subscription
        ]),
        new actions.UpdateProjectsStateAction([action.payload.project])
      ])
    )
  );

  constructor(private actions$: Actions) {}
}
