import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';

@Injectable()
export class CreateMconfigAndQuerySuccessEffect {
  @Effect() createMconfigAndQuerySuccess$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.CREATE_MCONFIG_AND_QUERY_SUCCESS),
    mergeMap((action: actions.CreateMconfigAndQuerySuccessAction) =>
      from([
        new actions.UpdateQueriesStateAction(action.payload.queries),
        new actions.UpdateMconfigsStateAction([action.payload.mconfig])
      ])
    )
  );

  constructor(private actions$: Actions) {}
}
