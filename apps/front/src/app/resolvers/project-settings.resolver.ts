import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { ProjectQuery } from '../queries/project.query';
import { ApiService } from '../services/api.service';
import { ProjectStore } from '../stores/project.store';

@Injectable({ providedIn: 'root' })
export class ProjectSettingsResolver implements Resolve<Observable<boolean>> {
  constructor(
    private projectStore: ProjectStore,
    private projectQuery: ProjectQuery,
    private apiService: ApiService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let projectId;

    this.projectQuery.projectId$.pipe(take(1)).subscribe(x => {
      projectId = x;
    });

    let payload: apiToBackend.ToBackendGetProjectRequestPayload = {
      projectId: projectId
    };

    return this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetProject,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendGetProjectResponse) => {
          this.projectStore.update(resp.payload.project);
          return true;
        })
      );
  }
}
