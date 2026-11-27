import type { ConnectedPosition } from '@angular/cdk/overlay';
import {
  ChangeDetectorRef,
  Component,
  Input,
  type OnInit
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, finalize, take, tap } from 'rxjs/operators';
import {
  DEMO_ORG_NAME,
  PATH_BRANCH,
  PATH_CONNECTIONS,
  PATH_ENV,
  PATH_ENVIRONMENTS,
  PATH_GIVENS,
  PATH_INFO,
  PATH_ORG,
  PATH_PROJECT,
  PATH_PROVIDERS,
  PATH_REPO,
  PATH_REPORT,
  PATH_REPORTS,
  PATH_REPORTS_LIST,
  PATH_ROLES,
  PATH_SANDBOX_PROVIDER,
  PATH_TEAM,
  PROD_REPO_ID,
  PROJECT_ENV_PROD
} from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ProjectReportLink } from '#common/types/backend/parts/project-report-link';
import type { ProjectsItem } from '#common/types/backend/parts/projects-item';
import type { ToBackendGetProjectsListOutput } from '#common/types/backend/routes/projects/get-projects-list/get-projects-list-output';
import type { ToBackendGetProjectsListRequest } from '#common/types/backend/routes/projects/get-projects-list/get-projects-list-request';
import type { ToBackendGetUserGivensOutput } from '#common/types/backend/routes/users/get-user-givens/get-user-givens-output';
import type { ToBackendGetUserGivensRequest } from '#common/types/backend/routes/users/get-user-givens/get-user-givens-request';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery, type NavState } from '#front/app/queries/nav.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery, type UserState } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { SpinnerService } from '#front/app/services/spinner.service';
import { railSubmenuPositions } from '../rail-submenu-positions';

@Component({
  standalone: false,
  selector: 'm-project-menu',
  templateUrl: './project-menu.component.html'
})
export class ProjectMenuComponent implements OnInit {
  @Input({ required: true })
  popupPositions: ConnectedPosition[];

  readonly submenuPositions = railSubmenuPositions;

  readonly appendNewProjectTooltipTo = (reference: Element): Element => {
    // CDK's popover is above document.body and outside the submenu's clip.
    let popover: Element = reference.closest('.cdk-overlay-popover');

    let container: Element = popover ?? reference.ownerDocument.body;

    return container;
  };

  demoOrgName = DEMO_ORG_NAME;

  projectsList: ProjectsItem[] = [];

  private projectsOrgId?: string;

  isProjectsListLoading = false;

  pathInfo = PATH_INFO;
  pathSandboxProvider = PATH_SANDBOX_PROVIDER;
  pathProviders = PATH_PROVIDERS;
  pathConnections = PATH_CONNECTIONS;
  pathEnvironments = PATH_ENVIRONMENTS;
  pathGivens = PATH_GIVENS;
  pathRoles = PATH_ROLES;
  pathTeam = PATH_TEAM;

  lastUrl: string;

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      this.lastUrl = x.url.split('/')[5];
      this.cd.detectChanges();
    })
  );

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  needSave = false;
  needSave$ = this.uiQuery.needSave$.pipe(tap(x => (this.needSave = x)));

  user: UserState;
  user$ = this.userQuery.select().pipe(
    tap(x => {
      this.user = x;
      this.cd.detectChanges();
    })
  );

  isEditor: boolean;
  isEditor$ = this.memberQuery.isEditor$.pipe(
    tap(x => {
      this.isEditor = x;
      this.cd.detectChanges();
    })
  );

  isAdmin: boolean;
  isAdmin$ = this.memberQuery.isAdmin$.pipe(
    tap(x => {
      this.isAdmin = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private spinnerService: SpinnerService,
    private uiQuery: UiQuery,
    private userQuery: UserQuery,
    private memberQuery: MemberQuery,
    private navQuery: NavQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private navigateService: NavigateService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.lastUrl = this.router.url.split('/')[5];
  }

  openProjectMenu(): void {
    let orgId: string = this.nav.orgId;

    if (isUndefined(orgId)) {
      return;
    }

    if (this.projectsOrgId !== orgId) {
      this.projectsOrgId = orgId;
      this.projectsList = [];
      this.isProjectsListLoading = false;
    }

    if (this.isProjectsListLoading) {
      return;
    }

    this.isProjectsListLoading = true;

    let payload: ToBackendGetProjectsListRequest['input'] = {
      orgId: orgId
    };

    this.apiService
      .req({
        route: 'api/ToBackendGetProjectsList',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success' || orgId !== this.nav.orgId) {
            return;
          }

          let output: ToBackendGetProjectsListOutput = resp.output;

          this.projectsList = output.projectsList;
        }),
        take(1),
        finalize(() => {
          if (orgId === this.projectsOrgId) {
            this.isProjectsListLoading = false;
            this.cd.detectChanges();
          }
        })
      )
      .subscribe();
  }

  createNewProject(): void {
    this.myDialogService.showCreateProject({
      apiService: this.apiService,
      orgId: this.nav.orgId
    });
  }

  projectChange(item: { project: ProjectsItem }): void {
    let { project } = item;

    let projectReportLinks: ProjectReportLink[] =
      this.uiQuery.getValue().projectReportLinks;

    let pLink: ProjectReportLink = projectReportLinks.find(
      link => link.projectId === project.projectId
    );

    let navParts: string[] = [
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      project.projectId,
      PATH_REPO,
      PROD_REPO_ID,
      PATH_BRANCH,
      project.defaultBranch,
      PATH_ENV,
      PROJECT_ENV_PROD,
      PATH_REPORTS
    ];

    if (isDefined(pLink)) {
      navParts.push(PATH_REPORT, pLink.reportId);
    } else {
      navParts.push(PATH_REPORTS_LIST);
    }

    void this.navigateService.navigateTo({ navParts: navParts });
  }

  navigateInfo() {
    this.router.navigate([
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_INFO
    ]);
  }

  navigateConnections() {
    this.router.navigate([
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_CONNECTIONS
    ]);
  }

  navigateProviders() {
    this.router.navigate([
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_PROVIDERS
    ]);
  }

  navigateEnvironments() {
    this.router.navigate([
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_ENVIRONMENTS
    ]);
  }

  navigateGivens() {
    this.router.navigate([
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_GIVENS
    ]);
  }

  navigateRoles() {
    this.router.navigate([
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_ROLES
    ]);
  }

  navigateTeam() {
    this.router.navigate([
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_TEAM
    ]);
  }

  navigateSandboxProvider() {
    this.router.navigate([
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_SANDBOX_PROVIDER
    ]);
  }

  showSelectedGivens() {
    let payload: ToBackendGetUserGivensRequest['input'] = {
      projectId: this.nav.projectId
    };

    this.apiService
      .req({
        route: 'api/ToBackendGetUserGivens',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendGetUserGivensOutput = resp.output;

          let user = output.user;

          this.userQuery.update(user);
          this.uiQuery.updatePart({ ...user.ui });

          this.myDialogService.showSelectedGivens({
            projectId: this.nav.projectId,
            userId: user.userId,
            memberGivens: output.memberGivens
          });
        }),
        take(1),
        this.spinnerService.appTrack()
      )
      .subscribe();
  }
}
