import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import * as Raven from 'raven-js';
import { from, Observable } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import * as actionTypes from '@app/store-actions/action-types';
import * as actions from '@app/store-actions/actions';

@Injectable()
export class ResetStateEffect {
  @Effect() resetState$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.RESET_STATE),
    tap((action: actions.ResetStateAction) =>
      Raven.setUserContext({ email: '' })
    ),
    mergeMap(() =>
      from([
        new actions.ResetLayoutStateAction(),
        new actions.ResetWebSocketStateAction(),
        new actions.ResetUserStateAction(),

        new actions.ResetDashboardsStateAction(),

        new actions.ResetMconfigsStateAction(),

        new actions.ResetPaymentsStateAction(),
        new actions.ResetFilesStateAction(),
        new actions.ResetErrorsStateAction(),
        new actions.ResetModelsStateAction(),
        new actions.ResetQueriesStateAction(),

        new actions.ResetSubscriptionsStateAction(),
        new actions.ResetMembersStateAction(),
        new actions.ResetReposStateAction(),

        new actions.ResetProjectsStateAction()
      ])
    )
  );

  constructor(private actions$: Actions) {}
}
