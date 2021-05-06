import { ChangeDetectorRef, Component } from '@angular/core';
import { map, take, tap } from 'rxjs/operators';
import { getFullName } from '~front/app/functions/get-full-name';
import { NavQuery } from '~front/app/queries/nav.query';
import { ProjectQuery } from '~front/app/queries/project.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { MemberExtended, ProjectStore } from '~front/app/stores/project.store';
import { apiToBackend } from '~front/barrels/api-to-backend';

@Component({
  selector: 'm-project-team',
  templateUrl: './project-team.component.html'
})
export class ProjectTeamComponent {
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

  members: MemberExtended[] = [];
  members$ = this.projectQuery.members$.pipe(
    tap(x => {
      x.forEach(m => {
        console.log(m);
        m.fullName = getFullName(m);
      });
      this.members = x;
      this.cd.detectChanges();
    })
  );

  isAdmin: boolean;
  isAdmin$ = this.projectQuery.isAdmin$.pipe(
    tap(x => {
      this.isAdmin = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    public projectQuery: ProjectQuery,
    public projectStore: ProjectStore,
    public navQuery: NavQuery,
    public userQuery: UserQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef
  ) {}

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

  removeMember(member: MemberExtended) {
    this.myDialogService.showRemoveMember({
      apiService: this.apiService,
      projectId: this.projectId,
      memberId: member.memberId,
      email: member.email
    });
  }

  isEditorChange(event: any, i: number) {
    console.log(event);
    console.log(i);

    let member = this.members[i];

    let payload: apiToBackend.ToBackendEditMemberRequestPayload = Object.assign(
      {},
      member,
      {
        isEditor: !member.isEditor
      }
    );

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditMember,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendEditMemberResponse) => {
          this.projectStore.update(state => {
            state.members[i] = resp.payload.member;
            return state;
          });
        }),
        take(1)
      )
      .subscribe();
  }
}
