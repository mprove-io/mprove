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
import {
  ToBackendCreateMemberRequestPayload,
  ToBackendCreateMemberResponse
} from '#common/interfaces/to-backend/members/to-backend-create-member';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { TeamQuery } from '#front/app/queries/team.query';
import { ApiService } from '#front/app/services/api.service';

export interface InviteMemberDialogData {
  apiService: ApiService;
  projectId: string;
}

@Component({
  selector: 'm-invite-member-dialog',
  templateUrl: './invite-member-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class InviteMemberDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild('email') emailElement: ElementRef;

  inviteMemberForm: FormGroup;

  constructor(
    public ref: DialogRef<InviteMemberDialogData>,
    private fb: FormBuilder,
    private teamQuery: TeamQuery
  ) {}

  ngOnInit() {
    this.inviteMemberForm = this.fb.group({
      email: [
        undefined,
        [Validators.required, Validators.email, Validators.maxLength(255)]
      ]
    });

    setTimeout(() => {
      this.emailElement.nativeElement.focus();
    }, 0);
  }

  invite() {
    this.inviteMemberForm.markAllAsTouched();

    if (!this.inviteMemberForm.valid) {
      return;
    }

    this.ref.close();

    let payload: ToBackendCreateMemberRequestPayload = {
      projectId: this.ref.data.projectId,
      email: this.inviteMemberForm.value.email
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCreateMember,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendCreateMemberResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let member = resp.payload.member;
            let teamState = this.teamQuery.getValue();

            this.teamQuery.update({
              members: [...teamState.members, member],
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
