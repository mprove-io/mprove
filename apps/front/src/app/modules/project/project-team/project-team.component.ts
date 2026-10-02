import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { take, tap } from 'rxjs/operators';
import { PROJECT_TEAM_PAGE_TITLE } from '#common/constants/page-titles';
import { MEMBERS_PER_PAGE } from '#common/constants/top-front';
import type { Member } from '#common/types/backend/member';
import type { Role } from '#common/types/backend/role';
import type { ToBackendEditMemberRequest } from '#common/types/backend/routes/members/edit-member/edit-member-request';
import type { ToBackendEditMemberResponse } from '#common/types/backend/routes/members/edit-member/edit-member-response';
import type { ToBackendGetMembersRequest } from '#common/types/backend/routes/members/get-members/get-members-request';
import type { ToBackendGetMembersResponse } from '#common/types/backend/routes/members/get-members/get-members-response';
import type { MemberExtended } from '#common/types/front/member-extended';
import { makeInitials } from '#front/app/functions/make-initials';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery } from '#front/app/queries/nav.query';
import { RolesQuery } from '#front/app/queries/roles.query';
import { TeamQuery } from '#front/app/queries/team.query';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';

@Component({
  standalone: false,
  selector: 'm-project-team',
  templateUrl: './project-team.component.html'
})
export class ProjectTeamComponent implements OnInit {
  pageTitle = PROJECT_TEAM_PAGE_TITLE;

  currentPage: any = 1;
  perPage = MEMBERS_PER_PAGE;

  userId: string;
  userId$ = this.userQuery.userId$.pipe(
    tap(x => {
      this.userId = x;
      this.cd.detectChanges();
    })
  );

  projectId: string;
  projectId$ = this.navQuery.projectId$.pipe(
    tap(x => {
      this.projectId = x;
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

  members: MemberExtended[] = [];
  members$ = this.teamQuery.members$.pipe(
    tap(x => {
      this.members = x.map(member =>
        Object.assign(member, {
          initials: makeInitials({
            firstName: member.firstName,
            lastName: member.lastName,
            alias: member.alias
          })
        })
      );
      this.cd.detectChanges();
    })
  );

  total: number;
  total$ = this.teamQuery.total$.pipe(
    tap(x => {
      this.total = x;
      this.cd.detectChanges();
    })
  );

  roles: Role[] = [];
  roles$ = this.rolesQuery.roles$.pipe(
    tap(x => {
      this.roles = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private teamQuery: TeamQuery,
    private memberQuery: MemberQuery,
    private navQuery: NavQuery,
    private rolesQuery: RolesQuery,
    private userQuery: UserQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
  }

  getMembers(pageNum: number) {
    let payload: ToBackendGetMembersRequest['input'] = {
      projectId: this.projectId,
      pageNum: pageNum,
      perPage: this.perPage
    };

    this.apiService
      .req({
        route: 'api/ToBackendGetMembers',
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetMembersResponse) => {
          if (resp?.type === 'Success') {
            this.teamQuery.update(resp.output);
            this.rolesQuery.update({
              roles: resp.output.roles
            });
            this.currentPage = pageNum;
          }
        }),
        take(1)
      )
      .subscribe();
  }

  showPhoto(item: {
    memberId: string;
    firstName: string;
    lastName: string;
    alias: string;
    avatarSmall: string;
  }) {
    let { memberId, firstName, lastName, alias, avatarSmall } = item;

    let initials = makeInitials({
      firstName: firstName,
      lastName: lastName,
      alias: alias
    });

    this.myDialogService.showPhoto({
      avatar: avatarSmall,
      initials: initials
    });
  }

  inviteMember() {
    this.myDialogService.showInviteMember({
      apiService: this.apiService,
      projectId: this.projectId
    });
  }

  removeMember(member: Member) {
    this.myDialogService.showRemoveMember({
      apiService: this.apiService,
      projectId: this.projectId,
      memberId: member.memberId,
      email: member.email
    });
  }

  isAdminChange(event: any, i: number) {
    let member = this.members[i];
    let m = Object.assign({}, member, {
      isAdmin: !member.isAdmin
    });
    this.apiEditMember(m, i);
  }

  isEditorChange(event: any, i: number) {
    let member = this.members[i];
    let m = Object.assign({}, member, {
      isEditor: !member.isEditor
    });
    this.apiEditMember(m, i);
  }

  isExplorerChange(event: any, i: number) {
    let member = this.members[i];
    let m = Object.assign({}, member, {
      isExplorer: !member.isExplorer
    });
    this.apiEditMember(m, i);
  }

  apiEditMember(member: Member, i: number) {
    let payload: ToBackendEditMemberRequest['input'] = {
      projectId: member.projectId,
      memberId: member.memberId,
      isAdmin: member.isAdmin,
      isEditor: member.isEditor,
      isExplorer: member.isExplorer,
      roles: member.roles
    };

    this.apiService
      .req({
        route: 'api/ToBackendEditMember',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendEditMemberResponse) => {
          if (resp?.type === 'Success') {
            let teamState = this.teamQuery.getValue();
            teamState.members[i] = resp.output.member;
            this.teamQuery.update({
              members: [...teamState.members],
              total: teamState.total
            });

            if (resp.output.member.memberId === this.userId) {
              this.memberQuery.update(resp.output.member);
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }

  addRole(member: Member, i: number) {
    this.myDialogService.showAddRole({
      apiService: this.apiService,
      member: member,
      i: i
    });
  }

  getMemberGivens(member: Member) {
    this.myDialogService.showGetMemberGivens({
      apiService: this.apiService,
      projectId: member.projectId,
      memberId: member.memberId,
      email: member.email
    });
  }

  removeRole(member: Member, i: number, n: number) {
    let newRoles = [...member.roles];
    newRoles.splice(n, 1);

    let payload: ToBackendEditMemberRequest['input'] = {
      projectId: member.projectId,
      memberId: member.memberId,
      isAdmin: member.isAdmin,
      isEditor: member.isEditor,
      isExplorer: member.isExplorer,
      roles: newRoles
    };

    this.apiService
      .req({
        route: 'api/ToBackendEditMember',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendEditMemberResponse) => {
          if (resp?.type === 'Success') {
            let teamState = this.teamQuery.getValue();
            teamState.members[i] = resp.output.member;

            this.teamQuery.update({
              members: [...teamState.members],
              total: teamState.total
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
