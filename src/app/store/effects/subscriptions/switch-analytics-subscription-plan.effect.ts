import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';
import * as services from 'app/services/_index';

@Injectable()
export class SwitchAnalyticsSubscriptionPlanEffect {
  @Effect() switchAnalyticsSubscriptionPlan$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.SWITCH_ANALYTICS_SUBSCRIPTION_PLAN),
    mergeMap((action: actions.SwitchAnalyticsSubscriptionPlanAction) =>
      this.backendService.switchAnalyticsSubscriptionPlan(action.payload).pipe(
        map(
          body =>
            new actions.SwitchAnalyticsSubscriptionPlanSuccessAction(
              body.payload
            )
        ),
        catchError(e =>
          of(
            new actions.SwitchAnalyticsSubscriptionPlanFailAction({ error: e })
          )
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService
  ) {}
}
