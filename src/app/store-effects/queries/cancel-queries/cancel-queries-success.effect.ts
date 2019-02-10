import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from '@app/store-actions/_index';
import * as actionTypes from '@app/store-action-types/index';

@Injectable()
export class CancelQueriesSuccessEffect {
  @Effect() cancelQueriesSuccess$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.CANCEL_QUERIES_SUCCESS),
    mergeMap((action: actions.CancelQueriesSuccessAction) =>
      from([
        new actions.UpdateQueriesStateAction(action.payload.canceled_queries)
      ])
    )
  );

  constructor(private actions$: Actions) {}
}
