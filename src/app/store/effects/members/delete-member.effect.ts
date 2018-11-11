import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actions from 'src/app/store/actions/_index';
import * as actionTypes from 'src/app/store/action-types';
import * as services from 'src/app/services/_index';

@Injectable()
export class DeleteMemberEffect {

  @Effect() deleteMember$: Observable<Action> = this.actions$
    .ofType(actionTypes.DELETE_MEMBER)
    .pipe(
      mergeMap((action: actions.DeleteMemberAction) => this.backendService.deleteMember(action.payload)
        .pipe(
          map(body => new actions.DeleteMemberSuccessAction(body.payload)),
          catchError(e => of(new actions.DeleteMemberFailAction({ error: e })))
        )
      )
    );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService) {
  }

}
