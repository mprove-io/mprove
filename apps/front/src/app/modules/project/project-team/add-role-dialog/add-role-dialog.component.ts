import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { TeamState, TeamStore } from '~front/app/stores/team.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface AddRoleDialogDataItem {
  apiService: ApiService;
  member: common.Member;
  i: number;
}

@Component({
  selector: 'm-add-role-dialog',
  templateUrl: './add-role-dialog.component.html'
})
export class AddRoleDialogComponent implements OnInit {
  addRoleForm: FormGroup;

  projectId: string;

  constructor(
    public ref: DialogRef<AddRoleDialogDataItem>,
    private fb: FormBuilder,
    private teamStore: TeamStore
  ) {}

  ngOnInit() {
    this.addRoleForm = this.fb.group({
      role: ['', [Validators.maxLength(255)]]
    });
  }

  add() {
    this.addRoleForm.markAllAsTouched();

    if (!this.addRoleForm.valid) {
      return;
    }

    this.ref.close();

    let member: common.Member = this.ref.data.member;

    let payload: apiToBackend.ToBackendEditMemberRequestPayload = {
      projectId: member.projectId,
      memberId: member.memberId,
      isAdmin: member.isAdmin,
      isEditor: member.isEditor,
      isExplorer: member.isExplorer,
      roles: [...member.roles, this.addRoleForm.value.role],
      envs: member.envs
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditMember,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendEditMemberResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.teamStore.update(state => {
              state.members[this.ref.data.i] = resp.payload.member;

              return <TeamState>{
                members: [...state.members],
                total: state.total
              };
            });
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
