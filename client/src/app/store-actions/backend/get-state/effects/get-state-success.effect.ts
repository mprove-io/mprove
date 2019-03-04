import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import * as Raven from 'raven-js';
import { from, Observable } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as actionTypes from '@app/store-actions/action-types';
import * as helper from '@app/helper/_index';

@Injectable()
export class GetStateSuccessEffect {
  @Effect() getStateSuccess$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.GET_STATE_SUCCESS),
    tap((action: actions.GetStateSuccessAction) =>
      Raven.setUserContext({
        email: action.payload.state.user.user_id
      })
    ),
    mergeMap((action: actions.GetStateSuccessAction) =>
      from([
        new actions.UpdateProjectsStateAction(action.payload.state.projects), // 1

        new actions.UpdateSubscriptionsStateAction(
          action.payload.state.subscriptions
        ), // 2
        new actions.UpdateMembersStateAction(action.payload.state.members), // 2

        new actions.UpdatePaymentsStateAction(action.payload.state.payments), // 3
        new actions.UpdateFilesStateAction(action.payload.state.files), // 3

        // new actions.ProcessStructsAction(action.payload.state.structs),
        ...helper.processStructsHelper(action.payload.state.structs), // 3

        new actions.UpdateWebSocketInitIdAction(action.payload.init_id), //

        new actions.UpdateUserStateAction(action.payload.state.user) // should be last for State Resolver
      ])
    )
  );

  constructor(private actions$: Actions) {}
}
