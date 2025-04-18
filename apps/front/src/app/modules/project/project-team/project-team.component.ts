import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { take, tap } from 'rxjs/operators';
import { makeInitials } from '~front/app/functions/make-initials';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { TeamQuery } from '~front/app/queries/team.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

class MemberExtended extends common.Member {
  initials: string;
}

@Component({
  selector: 'm-project-team',
  templateUrl: './project-team.component.html'
})
export class ProjectTeamComponent implements OnInit {
  pageTitle = constants.PROJECT_TEAM_PAGE_TITLE;

  currentPage: any = 1;
  perPage = constants.MEMBERS_PER_PAGE;

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
      // console.log(this.members);
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

  constructor(
    private teamQuery: TeamQuery,
    private memberQuery: MemberQuery,
    private navQuery: NavQuery,
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
    let payload: apiToBackend.ToBackendGetMembersRequestPayload = {
      projectId: this.projectId,
      pageNum: pageNum,
      perPage: this.perPage
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetMembers,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendGetMembersResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.teamQuery.update(resp.payload);
            this.currentPage = pageNum;
          }
        }),
        take(1)
      )
      .subscribe();
  }

  showPhoto(
    memberId: string,
    firstName: string,
    lastName: string,
    alias: string
  ) {
    let initials = makeInitials({
      firstName: firstName,
      lastName: lastName,
      alias: alias
    });

    let payload: apiToBackend.ToBackendGetAvatarBigRequestPayload = {
      avatarUserId: memberId
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetAvatarBig,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendGetAvatarBigResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.myDialogService.showPhoto({
              avatarBig: resp.payload.avatarBig,
              initials: initials
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  inviteMember() {
    this.myDialogService.showInviteMember({
      apiService: this.apiService,
      projectId: this.projectId
    });
  }

  removeMember(member: common.Member) {
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

  apiEditMember(member: common.Member, i: number) {
    let payload: apiToBackend.ToBackendEditMemberRequestPayload = {
      projectId: member.projectId,
      memberId: member.memberId,
      isAdmin: member.isAdmin,
      isEditor: member.isEditor,
      isExplorer: member.isExplorer,
      roles: member.roles
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditMember,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendEditMemberResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let teamState = this.teamQuery.getValue();
            teamState.members[i] = resp.payload.member;
            this.teamQuery.update({
              members: [...teamState.members],
              total: teamState.total
            });

            if (resp.payload.member.memberId === this.userId) {
              this.memberQuery.update(resp.payload.member);
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }

  addRole(member: common.Member, i: number) {
    this.myDialogService.showAddRole({
      apiService: this.apiService,
      member: member,
      i: i
    });
  }

  removeRole(member: common.Member, i: number, n: number) {
    let newRoles = [...member.roles];
    newRoles.splice(n, 1);

    let payload: apiToBackend.ToBackendEditMemberRequestPayload = {
      projectId: member.projectId,
      memberId: member.memberId,
      isAdmin: member.isAdmin,
      isEditor: member.isEditor,
      isExplorer: member.isExplorer,
      roles: newRoles
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditMember,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendEditMemberResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let teamState = this.teamQuery.getValue();
            teamState.members[i] = resp.payload.member;

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
