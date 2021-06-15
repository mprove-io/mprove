import { ChangeDetectorRef, Component } from '@angular/core';
import { map, take, tap } from 'rxjs/operators';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { TeamQuery } from '~front/app/queries/team.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { MemberStore } from '~front/app/stores/member.store';
import { TeamStore } from '~front/app/stores/team.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-project-team',
  templateUrl: './project-team.component.html'
})
export class ProjectTeamComponent {
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

  members: common.Member[] = [];
  members$ = this.teamQuery.members$.pipe(
    tap(x => {
      this.members = x;
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
    public teamQuery: TeamQuery,
    public teamStore: TeamStore,
    public memberStore: MemberStore,
    public memberQuery: MemberQuery,
    public navQuery: NavQuery,
    public userQuery: UserQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef
  ) {}

  getMembers(pageNum: number) {
    let payload: apiToBackend.ToBackendGetMembersRequestPayload = {
      projectId: this.projectId,
      pageNum: pageNum,
      perPage: this.perPage
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetMembers,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendGetMembersResponse) => {
          this.teamStore.update(resp.payload);
          this.currentPage = pageNum;
        }),
        take(1)
      )
      .subscribe();
  }

  showPhoto(memberId: string) {
    let payload: apiToBackend.ToBackendGetAvatarBigRequestPayload = {
      avatarUserId: memberId
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetAvatarBig,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendGetAvatarBigResponse) => {
          this.myDialogService.showPhoto({
            apiService: this.apiService,
            avatarBig: resp.payload.avatarBig
          });
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
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditMember,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendEditMemberResponse) => {
          this.teamStore.update(state => {
            state.members[i] = resp.payload.member;
            return state;
          });

          if (resp.payload.member.memberId === this.userId) {
            this.memberStore.update(resp.payload.member);
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
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditMember,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendEditMemberResponse) => {
          this.teamStore.update(state => {
            state.members[i] = resp.payload.member;
            return state;
          });
        }),
        take(1)
      )
      .subscribe();
  }
}