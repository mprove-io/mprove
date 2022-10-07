import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { TeamState, TeamStore } from '~front/app/stores/team.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface InviteMemberDialogDataItem {
  apiService: ApiService;
  projectId: string;
}

@Component({
  selector: 'm-invite-member-dialog',
  templateUrl: './invite-member-dialog.component.html'
})
export class InviteMemberDialogComponent implements OnInit {
  inviteMemberForm: FormGroup;

  constructor(
    public ref: DialogRef<InviteMemberDialogDataItem>,
    private fb: FormBuilder,
    private teamStore: TeamStore
  ) {}

  ngOnInit() {
    this.inviteMemberForm = this.fb.group({
      email: [undefined, [Validators.email, Validators.maxLength(255)]]
    });
  }

  invite() {
    this.inviteMemberForm.markAllAsTouched();

    if (!this.inviteMemberForm.valid) {
      return;
    }

    this.ref.close();

    let payload: apiToBackend.ToBackendCreateMemberRequestPayload = {
      projectId: this.ref.data.projectId,
      email: this.inviteMemberForm.value.email
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateMember,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateMemberResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let member = resp.payload.member;
            this.teamStore.update(
              state =>
                <TeamState>{
                  members: [...state.members, member],
                  total: state.total
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
