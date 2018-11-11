import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from 'src/app/store/actions/_index';
import * as actionTypes from 'src/app/store/action-types';

@Injectable()
export class CancelQueriesSuccessEffect {

  @Effect() cancelQueriesSuccess$: Observable<Action> = this.actions$
    .ofType(actionTypes.CANCEL_QUERIES_SUCCESS)
    .pipe(
      mergeMap((action: actions.CancelQueriesSuccessAction) => from([
        new actions.UpdateQueriesStateAction(action.payload.canceled_queries),
      ])
      )
    );


  constructor(
    private actions$: Actions) {
  }
}
