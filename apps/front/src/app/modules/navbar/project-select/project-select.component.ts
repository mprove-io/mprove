import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { map, take, tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavState, NavStore } from '~front/app/stores/nav.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-project-select',
  templateUrl: './project-select.component.html'
})
export class ProjectSelectComponent {
  projectsList: common.ProjectsItem[] = [];
  projectsListLoading = false;
  projectsListLength = 0;

  selectedProjectId: string;
  selectedProject$ = this.navQuery.project$.pipe(
    tap(x => {
      this.projectsList = [x];
      this.selectedProjectId = x.projectId;
      this.cd.detectChanges();
    })
  );

  selectedOrgId: string;
  selectedOrg$ = this.navQuery.org$.pipe(
    tap(x => {
      this.selectedOrgId = x.orgId;
      this.cd.detectChanges();
    })
  );

  constructor(
    private navQuery: NavQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private navStore: NavStore
  ) {}

  openProjectSelect() {
    this.projectsListLoading = true;

    let payload: apiToBackend.ToBackendGetProjectsListRequestPayload = {
      orgId: this.selectedOrgId
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetProjectsList,
        payload
      )
      .pipe(
        map(
          (resp: apiToBackend.ToBackendGetProjectsListResponse) =>
            resp.payload.projectsList
        ),
        tap(x => {
          this.projectsList = x;
          this.projectsListLoading = false;
          this.projectsListLength = x.length;
        }),
        take(1)
      )
      .subscribe();
  }

  createNewProject(projectSelect: any) {
    projectSelect.close();

    this.myDialogService.showCreateProject({
      apiService: this.apiService,
      orgId: this.selectedOrgId
    });
  }

  projectChange() {
    this.router.navigate([
      common.PATH_ORG,
      this.selectedOrgId,
      common.PATH_PROJECT,
      this.selectedProjectId,
      common.PATH_SETTINGS
    ]);

    this.navStore.update(state =>
      Object.assign({}, state, <NavState>{
        isRepoProd: true,
        branchId: common.BRANCH_MASTER
      })
    );
  }
}
