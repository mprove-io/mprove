import { Injectable } from '@angular/core';
import { TdLoadingService } from '@covalent/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import * as actions from 'src/app/store/actions/_index';
import * as actionTypes from 'src/app/store/action-types';

@Injectable()
export class RunQueriesDrySuccessEffect {

  @Effect() runQueriesDrySuccess$: Observable<Action> = this.actions$
    .ofType(actionTypes.RUN_QUERIES_DRY_SUCCESS)
    .pipe(
      mergeMap((action: actions.RunQueriesDrySuccessAction) => {

        let actionsArray = [];

        if (action.payload.error_queries.length > 0) {
          actionsArray = [
            new actions.UpdateQueriesStateAction(action.payload.error_queries),
            new actions.UpdateLayoutDryAction({
              dry_id: action.payload.dry_id,
              valid_estimates: action.payload.valid_estimates
            }),
          ];
        } else {
          actionsArray = [
            new actions.UpdateLayoutDryAction({
              dry_id: action.payload.dry_id,
              valid_estimates: action.payload.valid_estimates
            }),
          ];
        }

        return from(actionsArray);
      }),
      tap(() => this.loadingService.resolve('dry'))
    );


  constructor(
    private actions$: Actions,
    private loadingService: TdLoadingService) {
  }
}
