import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { ApiService } from '../services/api.service';
import { NavStore } from '../stores/nav.store';
import { ProjectStore } from '../stores/project.store';

@Injectable({ providedIn: 'root' })
export class ProjectResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navStore: NavStore,
    private projectStore: ProjectStore,
    private apiService: ApiService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let payload: apiToBackend.ToBackendGetProjectRequestPayload = {
      projectId: route.params[common.PARAMETER_PROJECT_ID]
    };

    return this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetProject,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendGetProjectResponse) => {
          let project = resp.payload.project;

          this.navStore.update(state =>
            Object.assign({}, state, {
              projectId: project.projectId,
              projectName: project.name,
              branchId: state.branchId || common.BRANCH_MASTER,
              isProdRepo: common.isDefined(state.branchId)
                ? state.isRepoProd
                : true
            })
          );

          localStorage.setItem(
            constants.LOCAL_STORAGE_PROJECT_ID,
            project.projectId
          );

          this.projectStore.update(project);
          return true;
        })
      );
  }
}
