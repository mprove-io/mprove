import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actionTypes from 'app/store/action-types';
import * as actions from 'app/store/actions/_index';
import * as helper from 'app/helper/_index';

@Injectable()
export class ProcessStructsEffect {
  @Effect() processStructs$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.PROCESS_STRUCTS),
    mergeMap((action: actions.ProcessStructsAction) =>
      from(helper.processStructsHelper(action.payload))
    )
  );

  constructor(private actions$: Actions) {}
}
