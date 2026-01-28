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
import { Env } from '#common/interfaces/backend/env';
import { Ev } from '#common/interfaces/backend/ev';
import {
  ToBackendDeleteEnvVarRequestPayload,
  ToBackendDeleteEnvVarResponse
} from '#common/interfaces/to-backend/envs/to-backend-delete-env-var';
import { EnvironmentsQuery } from '~front/app/queries/environments.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { ApiService } from '~front/app/services/api.service';

export interface DeleteEvDialogData {
  apiService: ApiService;
  env: Env;
  ev: Ev;
}

@Component({
  selector: 'm-delete-ev-dialog',
  templateUrl: './delete-ev-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class DeleteEvDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  dataItem: DeleteEvDialogData = this.ref.data;

  constructor(
    public ref: DialogRef<DeleteEvDialogData>,
    private memberQuery: MemberQuery,
    private environmentsQuery: EnvironmentsQuery
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    this.ref.close();

    let payload: ToBackendDeleteEnvVarRequestPayload = {
      projectId: this.dataItem.env.projectId,
      envId: this.dataItem.env.envId,
      evId: this.dataItem.ev.evId
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendDeleteEnvVar,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendDeleteEnvVarResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);
            this.environmentsQuery.update({ environments: resp.payload.envs });
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
