import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';

@Injectable()
export class DeleteMemberSuccessEffect {
  @Effect() deleteMemberSuccess$: Observable<Action> = this.actions$
    .ofType(actionTypes.DELETE_MEMBER_SUCCESS)
    .pipe(
      mergeMap((action: actions.DeleteMemberSuccessAction) =>
        from([new actions.UpdateMembersStateAction([action.payload.member])])
      )
    );

  constructor(private actions$: Actions) {}
}
