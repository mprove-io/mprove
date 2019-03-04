import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as interfaces from '@app/interfaces/_index';
import * as services from '@app/services/_index';
import * as constants from '@app/constants/_index';
import * as actionTypes from '@app/store-actions/action-types';
import { Router } from '@angular/router';

@Injectable()
export class DeleteUserSuccessEffect {
  @Effect() deleteUserSuccess$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.DELETE_USER_SUCCESS),
    mergeMap((action: actions.DeleteUserSuccessAction) =>
      from([
        new actions.UpdateUserStateAction(action.payload.deleted_user),
        new actions.UpdateMembersStateAction(action.payload.members)
      ])
    )
  );

  constructor(private actions$: Actions) {}
}
