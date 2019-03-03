import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as api from '@app/api/_index';
import * as services from '@app/services/_index';
import * as actionTypes from '@app/store-actions/action-types';

@Injectable()
export class CreateMemberFailEffect {
  @Effect() createMemberFail$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.CREATE_MEMBER_FAIL),
    mergeMap((action: actions.CreateMemberFailAction) => {
      let e = action.payload.error;

      if (
        e &&
        e.data &&
        e.data.response &&
        e.data.response.body &&
        e.data.response.body.info &&
        [api.ServerResponseStatusEnum.INVITE_MEMBER_ERROR_USER_DELETED].indexOf(
          e.data.response.body.info.status
        ) > -1
      ) {
        this.myDialogService.showInfoDialog(e.data.response.body.info.status);

        return of({ type: 'EMPTY ACTION' });
      } else {
        return of(new actions.BackendFailAction({ error: e }));
      }
    })
  );

  constructor(
    private actions$: Actions,
    private myDialogService: services.MyDialogService
  ) {}
}
