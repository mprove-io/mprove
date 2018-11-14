import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';
import * as enums from 'app/enums/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';
import * as constants from 'app/constants/_index';

@Injectable()
export class UpdateMembersStateEffect {
  @Effect({ dispatch: false }) updateMembersState$: Observable<
    Action
  > = this.actions$.ofType(actionTypes.UPDATE_MEMBERS_STATE).pipe(
    tap((action: actions.UpdateMembersStateAction) => {
      let userId: string;
      this.store
        .select(selectors.getUserId)
        .pipe(take(1))
        .subscribe(id => (userId = id));

      let selectedProjectId: string;
      this.store
        .select(selectors.getLayoutProjectId)
        .pipe(take(1))
        .subscribe(id => (selectedProjectId = id));

      let storeMembers: api.Member[];
      this.store
        .select(selectors.getMembersState)
        .pipe(take(1))
        .subscribe(entities => (storeMembers = entities));

      action.payload.forEach((payloadMember: api.Member) => {
        // check if payloadMember is user && payloadMember updated state
        if (
          payloadMember.member_id === userId &&
          storeMembers.findIndex(
            storeMember => payloadMember.server_ts === storeMember.server_ts
          ) >= 0
        ) {
          if (payloadMember.project_id === selectedProjectId) {
            if (
              payloadMember.is_editor === false ||
              payloadMember.deleted === true
            ) {
              // set needSave False
              this.store
                .select(selectors.getLayoutNeedSave)
                .pipe(take(1))
                .subscribe(needSave => {
                  if (needSave) {
                    this.store.dispatch(
                      new actions.SetLayoutNeedSaveFalseAction()
                    );
                  }
                });

              // navigate profile
              this.router.navigate(['profile']);

              // set prod mode
              let mode: enums.LayoutModeEnum;
              this.store
                .select(selectors.getLayoutMode)
                .pipe(take(1))
                .subscribe(x => (mode = x));

              if (mode === enums.LayoutModeEnum.Dev) {
                this.store.dispatch(new actions.SetLayoutModeProdAction());
              }
            }

            if (payloadMember.deleted === true) {
              // select Demo project
              this.store.dispatch(
                new actions.UpdateLayoutProjectIdAction(constants.DEMO)
              );
            }
          }

          if (payloadMember.deleted === true) {
            // remove project where user deleted
            this.store.dispatch(
              new actions.RemoveProjectAction(payloadMember.project_id)
            );
          }
        }
      });
    })
  );

  constructor(
    private actions$: Actions,
    private router: Router,
    private store: Store<interfaces.AppState>
  ) {}
}
