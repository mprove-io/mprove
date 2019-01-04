import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';

@Injectable()
export class CreateDashboardSuccessEffect {
  @Effect() createDashboardSuccess$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.CREATE_DASHBOARD_SUCCESS),
    mergeMap((action: actions.CreateDashboardSuccessAction) =>
      from([
        new actions.UpdateQueriesStateAction(action.payload.dashboard_queries),
        new actions.UpdateMconfigsStateAction(
          action.payload.dashboard_mconfigs
        ),
        new actions.UpdateDashboardsStateAction([action.payload.dashboard])
      ])
    )
  );

  constructor(private actions$: Actions) {}
}
