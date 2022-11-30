import { Component, HostListener, OnInit } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { TeamState, TeamStore } from '~front/app/stores/team.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface RemoveMemberDialogData {
  apiService: ApiService;
  projectId: string;
  memberId: string;
  email: string;
}

@Component({
  selector: 'm-remove-member-dialog',
  templateUrl: './remove-member-dialog.component.html'
})
export class RemoveMemberDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  constructor(
    public ref: DialogRef<RemoveMemberDialogData>,
    private teamStore: TeamStore
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  remove() {
    this.ref.close();

    let payload: apiToBackend.ToBackendDeleteMemberRequestPayload = {
      projectId: this.ref.data.projectId,
      memberId: this.ref.data.memberId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteMember,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteMemberResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.teamStore.update(
              state =>
                <TeamState>{
                  members: state.members.filter(
                    x =>
                      x.memberId !== this.ref.data.memberId ||
                      x.projectId !== this.ref.data.projectId
                  )
                }
            );
          }
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
