import {
  ChangeDetectorRef,
  Component,
  HostListener,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { map, take, tap } from 'rxjs/operators';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UserQuery, UserState } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';

@Component({
  standalone: false,
  selector: 'm-project-select',
  templateUrl: './project-select.component.html'
})
export class ProjectSelectComponent {
  @ViewChild('projectSelect', { static: false })
  projectSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.projectSelectElement?.close();
  }

  firstOrgName = FIRST_ORG_NAME;

  projectsList: ProjectsItem[] = [];
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
    private navigateService: NavigateService,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {}

  openProjectSelect() {
    this.projectsListLoading = true;

    let payload: ToBackendGetProjectsListRequestPayload = {
      orgId: this.selectedOrgId
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetProjectsList,
        payload: payload
      })
      .pipe(
        map(
          (resp: ToBackendGetProjectsListResponse) => resp.payload.projectsList
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

  createNewProject() {
    this.projectSelectElement?.close();

    this.myDialogService.showCreateProject({
      apiService: this.apiService,
      orgId: this.selectedOrgId
    });
  }

  projectChange() {
    let branchId = this.projectsList.find(
      p => p.projectId === this.selectedProjectId
    ).defaultBranch;

    let navParts = [
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.selectedProjectId,
      PATH_REPO,
      PROD_REPO_ID,
      PATH_BRANCH,
      branchId,
      PATH_ENV,
      PROJECT_ENV_PROD,
      PATH_REPORTS,
      PATH_REPORT,
      LAST_SELECTED_REPORT_ID
    ];

    this.navigateService.navigateTo({ navParts: navParts });
  }
}
