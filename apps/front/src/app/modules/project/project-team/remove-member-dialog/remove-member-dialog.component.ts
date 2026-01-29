import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendDeleteMemberRequestPayload,
  ToBackendDeleteMemberResponse
} from '#common/interfaces/to-backend/members/to-backend-delete-member';
import { TeamQuery } from '#front/app/queries/team.query';
import { ApiService } from '#front/app/services/api.service';

export interface RemoveMemberDialogData {
  apiService: ApiService;
  projectId: string;
  memberId: string;
  email: string;
}

@Component({
  selector: 'm-remove-member-dialog',
  templateUrl: './remove-member-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class RemoveMemberDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  constructor(
    public ref: DialogRef<RemoveMemberDialogData>,
    private teamQuery: TeamQuery
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  remove() {
    this.ref.close();

    let payload: ToBackendDeleteMemberRequestPayload = {
      projectId: this.ref.data.projectId,
      memberId: this.ref.data.memberId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendDeleteMember,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendDeleteMemberResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let teamState = this.teamQuery.getValue();

            this.teamQuery.update({
              members: teamState.members.filter(
                x =>
                  x.memberId !== this.ref.data.memberId ||
                  x.projectId !== this.ref.data.projectId
              ),
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
