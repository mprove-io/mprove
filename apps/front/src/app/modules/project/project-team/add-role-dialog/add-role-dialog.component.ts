import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { Member } from '#common/interfaces/backend/member';
import {
  ToBackendEditMemberRequestPayload,
  ToBackendEditMemberResponse
} from '#common/interfaces/to-backend/members/to-backend-edit-member';
import { SharedModule } from '~front/app/modules/shared/shared.module';
import { TeamQuery } from '~front/app/queries/team.query';
import { ApiService } from '~front/app/services/api.service';

export interface AddRoleDialogData {
  apiService: ApiService;
  member: Member;
  i: number;
}

@Component({
  selector: 'm-add-role-dialog',
  templateUrl: './add-role-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
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

    let member: Member = this.ref.data.member;

    let payload: ToBackendEditMemberRequestPayload = {
      projectId: member.projectId,
      memberId: member.memberId,
      isAdmin: member.isAdmin,
      isEditor: member.isEditor,
      isExplorer: member.isExplorer,
      roles: [...member.roles, this.addRoleForm.value.role]
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendEditMember,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendEditMemberResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
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
