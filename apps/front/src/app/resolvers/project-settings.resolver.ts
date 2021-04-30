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
import { ApiService } from '../services/api.service';
import { ProjectStore } from '../stores/project.store';

@Injectable({ providedIn: 'root' })
export class ProjectSettingsResolver implements Resolve<Observable<boolean>> {
  constructor(
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
          this.projectStore.update(project);
          return true;
        })
      );
  }
}
