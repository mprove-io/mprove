import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { take, tap } from 'rxjs/operators';
import { PROJECT_TEAM_PAGE_TITLE } from '~common/constants/page-titles';
import { MEMBERS_PER_PAGE } from '~common/constants/top-front';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { Member } from '~common/interfaces/backend/member';
import {
  ToBackendEditMemberRequestPayload,
  ToBackendEditMemberResponse
} from '~common/interfaces/to-backend/members/to-backend-edit-member';
import {
  ToBackendGetMembersRequestPayload,
  ToBackendGetMembersResponse
} from '~common/interfaces/to-backend/members/to-backend-get-members';
import { makeInitials } from '~front/app/functions/make-initials';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { TeamQuery } from '~front/app/queries/team.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';

class MemberExtended extends Member {
  initials: string;
}

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
    let payload: ToBackendGetMembersRequestPayload = {
      projectId: this.projectId,
      pageNum: pageNum,
      perPage: this.perPage
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetMembers,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetMembersResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.teamQuery.update(resp.payload);
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

    // let payload: ToBackendGetAvatarBigRequestPayload = {
    //   avatarUserId: memberId
    // };

    // this.apiService
    //   .req({
    //     pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetAvatarBig,
    //     payload: payload,
    //     showSpinner: true
    //   })
    //   .pipe(
    //     tap((resp: ToBackendGetAvatarBigResponse) => {
    //       if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
    //         this.myDialogService.showPhoto({
    //           avatar: resp.payload.avatarBig,
    //           initials: initials
    //         });
    //       }
    //     }),
    //     take(1)
    //   )
    //   .subscribe();
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
    let payload: ToBackendEditMemberRequestPayload = {
      projectId: member.projectId,
      memberId: member.memberId,
      isAdmin: member.isAdmin,
      isEditor: member.isEditor,
      isExplorer: member.isExplorer,
      roles: member.roles
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendEditMember,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendEditMemberResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
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

  addRole(member: Member, i: number) {
    this.myDialogService.showAddRole({
      apiService: this.apiService,
      member: member,
      i: i
    });
  }

  removeRole(member: Member, i: number, n: number) {
    let newRoles = [...member.roles];
    newRoles.splice(n, 1);

    let payload: ToBackendEditMemberRequestPayload = {
      projectId: member.projectId,
      memberId: member.memberId,
      isAdmin: member.isAdmin,
      isEditor: member.isEditor,
      isExplorer: member.isExplorer,
      roles: newRoles
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendEditMember,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendEditMemberResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
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
