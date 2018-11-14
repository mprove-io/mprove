import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';

@Injectable()
export class SetUserNameSuccessEffect {
  @Effect() setUserNameSuccess$: Observable<Action> = this.actions$
    .ofType(actionTypes.SET_USER_NAME_SUCCESS)
    .pipe(
      mergeMap((action: actions.SetUserNameSuccessAction) =>
        from([
          new actions.UpdateUserStateAction(action.payload.user),
          new actions.UpdateMembersStateAction(action.payload.members)
        ])
      )
    );

  constructor(private actions$: Actions) {}
}
