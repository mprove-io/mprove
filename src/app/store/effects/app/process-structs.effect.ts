import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actionTypes from 'src/app/store/action-types';
import * as actions from 'src/app/store/actions/_index';
import * as helper from 'src/app/helper/_index';

@Injectable()
export class ProcessStructsEffect {

  @Effect() processStructs$: Observable<Action> = this.actions$
    .ofType(actionTypes.PROCESS_STRUCTS)
    .pipe(
      mergeMap((action: actions.ProcessStructsAction) => from(helper.processStructsHelper(action.payload)))
    );

  constructor(
    private actions$: Actions) {
  }
}
