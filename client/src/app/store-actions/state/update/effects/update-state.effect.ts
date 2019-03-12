import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actionTypes from '@app/store-actions/action-types';
import * as actions from '@app/store-actions/actions';

@Injectable()
export class UpdateStateEffect {
  @Effect() updateState$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.UPDATE_STATE),
    mergeMap((action: actions.UpdateStateAction) => {
      let nextActions = [];

      if (action.payload.projects.length > 0) {
        nextActions.push(
          new actions.UpdateProjectsStateAction(action.payload.projects)
        );
      }

      if (action.payload.members.length > 0) {
        nextActions.push(
          new actions.UpdateMembersStateAction(action.payload.members)
        );
      }

      if (action.payload.files.length > 0) {
        nextActions.push(
          new actions.UpdateFilesStateAction(action.payload.files)
        );
      }

      if (action.payload.repos.length > 0) {
        nextActions.push(
          new actions.UpdateReposStateAction(action.payload.repos)
        );
      }

      if (action.payload.errors.length > 0) {
        nextActions.push(
          new actions.UpdateErrorsStateAction(action.payload.errors)
        );
      }

      if (action.payload.models.length > 0) {
        nextActions.push(
          new actions.UpdateModelsStateAction(action.payload.models)
        );
      }

      if (action.payload.queries.length > 0) {
        nextActions.push(
          new actions.UpdateQueriesStateAction(action.payload.queries)
        );
      }

      if (action.payload.mconfigs.length > 0) {
        nextActions.push(
          new actions.UpdateMconfigsStateAction(action.payload.mconfigs)
        );
      }

      if (action.payload.dashboards.length > 0) {
        nextActions.push(
          new actions.UpdateDashboardsStateAction(action.payload.dashboards)
        );
      }

      if (action.payload.user) {
        nextActions.push(
          new actions.UpdateUserStateAction(action.payload.user)
        );
      }

      return from(nextActions);
    })
  );

  constructor(private actions$: Actions) {}
}
