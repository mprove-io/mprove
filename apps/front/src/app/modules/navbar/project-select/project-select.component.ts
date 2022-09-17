import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { map, take, tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavState, NavStore } from '~front/app/stores/nav.store';
import { UserState } from '~front/app/stores/user.store';
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

  needSave = false;
  needSave$ = this.uiQuery.needSave$.pipe(tap(x => (this.needSave = x)));

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  user: UserState;
  user$ = this.userQuery.select().pipe(
    tap(x => {
      this.user = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private uiQuery: UiQuery,
    private userQuery: UserQuery,
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
        branchId: this.projectsList.find(
          x => x.projectId === this.selectedProjectId
        ).defaultBranch
      })
    );
  }
}
