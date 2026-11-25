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
  PATH_ACCOUNT,
  PATH_ORG,
  PATH_USERS,
  PROJECT_ENV_PROD,
  RESTRICTED_USER_ALIAS
} from '#common/constants/top';
import { LOCAL_STORAGE_PROJECT_ID } from '#common/constants/top-front';
import type { OrgsItem } from '#common/types/backend/parts/orgs-item';
import type { ToBackendGetOrgsListOutput } from '#common/types/backend/routes/orgs/get-orgs-list/get-orgs-list-output';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery, UserState } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { railSubmenuPositions } from '../rail-submenu-positions';

@Component({
  standalone: false,
  selector: 'm-org-menu',
  templateUrl: './org-menu.component.html'
})
export class OrgMenuComponent implements OnInit {
  @Input({ required: true })
  popupPositions: ConnectedPosition[];

  readonly submenuPositions = railSubmenuPositions;

  restrictedUserAlias = RESTRICTED_USER_ALIAS;

  orgsList: OrgsItem[] = [];

  isOrgsListLoading = false;

  pathAccount = PATH_ACCOUNT;
  pathUsers = PATH_USERS;

  lastUrl: string;

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      this.lastUrl = x.url.split('/')[3];
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

  constructor(
    private uiQuery: UiQuery,
    private userQuery: UserQuery,
    private navQuery: NavQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.lastUrl = this.router.url.split('/')[3];
  }

  openOrgMenu(): void {
    if (this.isOrgsListLoading) {
      return;
    }

    this.isOrgsListLoading = true;

    this.apiService
      .req({
        route: 'api/ToBackendGetOrgsList',
        payload: {}
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendGetOrgsListOutput = resp.output;

          this.orgsList = output.orgsList;
        }),
        take(1),
        finalize(() => {
          this.isOrgsListLoading = false;
          this.cd.detectChanges();
        })
      )
      .subscribe();
  }

  createNewOrg(): void {
    this.myDialogService.showCreateOrg({
      apiService: this.apiService
    });
  }

  orgChange(item: { orgId: string }): void {
    let { orgId } = item;

    void this.router.navigate([PATH_ORG, orgId, PATH_ACCOUNT]);

    this.navQuery.updatePart({
      projectId: undefined,
      projectName: undefined,
      projectDefaultBranch: undefined,
      repoId: undefined,
      repoType: undefined,
      branchId: undefined,
      envId: PROJECT_ENV_PROD,
      needValidate: false
    });

    localStorage.removeItem(LOCAL_STORAGE_PROJECT_ID);
  }

  navigateAccount() {
    this.router.navigate([PATH_ORG, this.nav.orgId, PATH_ACCOUNT]);
  }

  navigateUsers() {
    this.router.navigate([PATH_ORG, this.nav.orgId, PATH_USERS]);
  }
}
