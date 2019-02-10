import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/_index';
import * as actionTypes from '@app/store-action-types/index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store/selectors/_index';

@Injectable()
export class SetLiveQueriesSuccessEffect {
  @Effect({ dispatch: false }) setLiveQueriesSuccess$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.SET_LIVE_QUERIES_SUCCESS),
    tap((action: actions.SetLiveQueriesSuccessAction) => {
      if (action.payload.live_queries.length > 0) {
        let selectedProjectId: string;
        this.store
          .select(selectors.getLayoutProjectId)
          .pipe(take(1))
          .subscribe(id => (selectedProjectId = id));

        this.store.dispatch(
          new actions.FilterQueriesStateAction({
            project_id: selectedProjectId,
            query_ids: action.payload.live_queries
          })
        );
      }
    })
  );

  constructor(
    private actions$: Actions,
    private store: Store<interfaces.AppState>
  ) {}
}
