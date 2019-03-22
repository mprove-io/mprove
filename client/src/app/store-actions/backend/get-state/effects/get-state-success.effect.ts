import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as actionTypes from '@app/store-actions/action-types';
import * as helper from '@app/helper/_index';

@Injectable()
export class GetStateSuccessEffect {
  @Effect() getStateSuccess$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.GET_STATE_SUCCESS),
    mergeMap((action: actions.GetStateSuccessAction) =>
      from([
        new actions.UpdateProjectsStateAction(action.payload.state.projects), // 1

        new actions.UpdateMembersStateAction(action.payload.state.members), // 2

        new actions.UpdateFilesStateAction(action.payload.state.files), // 3

        ...helper.processStructsHelper(action.payload.state.structs), // 3

        new actions.UpdateWebSocketInitIdAction(action.payload.init_id), //

        new actions.UpdateUserStateAction(action.payload.state.user) // should be last for State Resolver
      ])
    )
  );

  constructor(private actions$: Actions) {}
}
