import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { map, take } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { TeamStore } from '~front/app/stores/team.store';
import { apiToBackend } from '~front/barrels/api-to-backend';

@Component({
  selector: 'm-invite-member-dialog',
  templateUrl: './invite-member-dialog.component.html'
})
export class InviteMemberDialogComponent implements OnInit {
  inviteMemberForm: FormGroup;

  projectId: string;

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
    private teamStore: TeamStore
  ) {}

  ngOnInit() {
    this.inviteMemberForm = this.fb.group({
      email: [
        this.ref.data.email,
        [Validators.email, Validators.maxLength(255)]
      ]
    });
  }

  save() {
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
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateMember,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendCreateMemberResponse) => {
          let member = resp.payload.member;
          this.teamStore.update(state => ({
            members: [...state.members, member]
          }));
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
