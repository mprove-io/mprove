import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';

@Injectable()
export class CreateProjectSuccessEffect {
  @Effect() createProjectSuccess$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.CREATE_PROJECT_SUCCESS),
    mergeMap((action: actions.CreateProjectSuccessAction) =>
      from([
        new actions.UpdateProjectsStateAction([action.payload.project]),
        new actions.UpdateMembersStateAction([action.payload.member]),
        new actions.UpdateFilesStateAction([
          ...action.payload.dev_files,
          ...action.payload.prod_files
        ]),
        new actions.ProcessStructsAction([
          action.payload.dev_struct,
          action.payload.prod_struct
        ])
      ])
    ),
    tap((action: any) => {
      if (action.type === actionTypes.UPDATE_PROJECTS_STATE) {
        this.router.navigate([
          '/project',
          action.payload[0].project_id,
          'team'
        ]);
      }
    })
  );

  constructor(private actions$: Actions, private router: Router) {}
}
