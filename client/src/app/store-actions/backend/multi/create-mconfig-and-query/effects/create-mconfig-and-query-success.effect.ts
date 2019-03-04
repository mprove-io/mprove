import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as interfaces from '@app/interfaces/_index';
import * as services from '@app/services/_index';
import * as actionTypes from '@app/store-actions/action-types';

@Injectable()
export class CreateMconfigAndQuerySuccessEffect {
  @Effect({ dispatch: false }) createMconfigAndQuerySuccess$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.CREATE_MCONFIG_AND_QUERY_SUCCESS),
    tap((action: actions.CreateMconfigAndQuerySuccessAction) => {
      this.store.dispatch(
        new actions.UpdateQueriesStateAction(action.payload.api_payload.queries)
      );
      this.store.dispatch(
        new actions.UpdateMconfigsStateAction([
          action.payload.api_payload.mconfig
        ])
      );
      action.payload.navigate();
    })
  );

  constructor(
    private actions$: Actions,
    private store: Store<interfaces.AppState>,
    private navigateService: services.NavigateService
  ) {}
}
