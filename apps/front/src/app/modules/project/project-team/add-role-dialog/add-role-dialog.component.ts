import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { map, take } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { TeamStore } from '~front/app/stores/team.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-add-role-dialog',
  templateUrl: './add-role-dialog.component.html'
})
export class AddRoleDialogComponent implements OnInit {
  addRoleForm: FormGroup;

  projectId: string;

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
    private teamStore: TeamStore
  ) {}

  ngOnInit() {
    this.addRoleForm = this.fb.group({
      role: ['', [Validators.maxLength(255)]]
    });
  }

  save() {
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
      roles: [...member.roles, this.addRoleForm.value.role]
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditMember,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendEditMemberResponse) => {
          this.teamStore.update(state => {
            state.members[this.ref.data.i] = resp.payload.member;
            return state;
          });
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
