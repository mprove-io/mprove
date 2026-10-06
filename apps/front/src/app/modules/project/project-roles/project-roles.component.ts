import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { take, tap } from 'rxjs/operators';
import { PROJECT_ROLES_PAGE_TITLE } from '#common/constants/page-titles';
import type { Given } from '#common/types/backend/parts/given/given';
import type { Gv } from '#common/types/backend/parts/gv';
import type { Role } from '#common/types/backend/parts/role';
import type { ToBackendDeleteRoleGivenRequest } from '#common/types/backend/routes/roles/delete-role-given/delete-role-given-request';
import type { ToBackendDeleteRoleGivenResponse } from '#common/types/backend/routes/roles/delete-role-given/delete-role-given-response';
import { GivensQuery } from '#front/app/queries/givens.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery, type NavState } from '#front/app/queries/nav.query';
import { RolesQuery } from '#front/app/queries/roles.query';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';

@Component({
  standalone: false,
  selector: 'm-project-roles',
  templateUrl: './project-roles.component.html'
})
export class ProjectRolesComponent implements OnInit {
  pageTitle = PROJECT_ROLES_PAGE_TITLE;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
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

  roles: Role[] = [];
  roles$ = this.rolesQuery.roles$.pipe(
    tap(x => {
      this.roles = x.sort((a, b) =>
        a.roleId > b.roleId ? 1 : b.roleId > a.roleId ? -1 : 0
      );
      this.cd.detectChanges();
    })
  );

  givens: Given[] = [];
  givens$ = this.givensQuery.givens$.pipe(
    tap(x => {
      this.givens = x.sort((a, b) =>
        a.givenId > b.givenId ? 1 : b.givenId > a.givenId ? -1 : 0
      );
      this.cd.detectChanges();
    })
  );

  constructor(
    private cd: ChangeDetectorRef,
    private rolesQuery: RolesQuery,
    private givensQuery: GivensQuery,
    private myDialogService: MyDialogService,
    private apiService: ApiService,
    private navQuery: NavQuery,
    private memberQuery: MemberQuery,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
  }

  addRole() {
    this.myDialogService.showAddProjectRole({
      apiService: this.apiService,
      projectId: this.nav.projectId
    });
  }

  deleteRole(role: Role) {
    this.myDialogService.showDeleteProjectRole({
      apiService: this.apiService,
      role: role
    });
  }

  addRoleGiven(role: Role) {
    this.myDialogService.showAddRoleGiven({
      apiService: this.apiService,
      role: role,
      givens: this.givens
    });
  }

  editRoleGiven(role: Role, gv: Gv) {
    this.myDialogService.showEditRoleGiven({
      apiService: this.apiService,
      role: role,
      gv: gv,
      givens: this.givens
    });
  }

  deleteRoleGiven(role: Role, gv: Gv) {
    let payload: ToBackendDeleteRoleGivenRequest['input'] = {
      projectId: role.projectId,
      roleId: role.roleId,
      givenId: gv.givenId
    };

    this.apiService
      .req({
        route: 'api/ToBackendDeleteRoleGiven',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendDeleteRoleGivenResponse) => {
          if (resp.type === 'Success') {
            this.memberQuery.update(resp.output.userMember);
            this.rolesQuery.update({ roles: resp.output.roles });
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
