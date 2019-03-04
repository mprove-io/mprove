import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as services from '@app/services/_index';
import * as interfaces from '@app/interfaces/_index';
import * as actionTypes from '@app/store-actions/action-types';

@Injectable()
export class DuplicateMconfigAndQuerySuccessEffect {
  @Effect({ dispatch: false }) duplicateMconfigAndQuerySuccess$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.DUPLICATE_MCONFIG_AND_QUERY_SUCCESS),
    tap((action: actions.DuplicateMconfigAndQuerySuccessAction) => {
      this.store.dispatch(
        new actions.UpdateQueriesStateAction([action.payload.query])
      );
      this.store.dispatch(
        new actions.UpdateMconfigsStateAction([action.payload.mconfig])
      );

      this.navigateService.navigateModelMconfigQueryChart(
        action.payload.mconfig.model_id,
        action.payload.mconfig.mconfig_id,
        action.payload.mconfig.query_id,
        action.payload.mconfig.charts[0].chart_id
      );
    })
  );

  constructor(
    private actions$: Actions,
    private navigateService: services.NavigateService,
    private store: Store<interfaces.AppState>
  ) {}
}
