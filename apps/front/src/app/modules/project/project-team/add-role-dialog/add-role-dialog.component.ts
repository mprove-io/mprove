import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { TeamQuery } from '~front/app/queries/team.query';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface AddRoleDialogData {
  apiService: ApiService;
  member: common.Member;
  i: number;
}

@Component({
  selector: 'm-add-role-dialog',
  templateUrl: './add-role-dialog.component.html'
})
export class AddRoleDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild('role') roleElement: ElementRef;

  addRoleForm: FormGroup;

  projectId: string;

  constructor(
    public ref: DialogRef<AddRoleDialogData>,
    private fb: FormBuilder,
    private teamQuery: TeamQuery
  ) {}

  ngOnInit() {
    this.addRoleForm = this.fb.group({
      role: ['', [Validators.required, Validators.maxLength(255)]]
    });

    setTimeout(() => {
      this.roleElement.nativeElement.focus();
    }, 0);
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

            teamState.members[this.ref.data.i] = resp.payload.member;

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

  cancel() {
    this.ref.close();
  }
}
