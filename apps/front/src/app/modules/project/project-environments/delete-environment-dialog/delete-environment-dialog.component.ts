import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { PROJECT_ENV_PROD } from '~common/constants/top';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendDeleteEnvRequestPayload,
  ToBackendDeleteEnvResponse
} from '~common/interfaces/to-backend/envs/to-backend-delete-env';
import { EnvironmentsQuery } from '~front/app/queries/environments.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';

export interface DeleteEnvironmentDialogData {
  apiService: ApiService;
  projectId: string;
  envId: string;
}

@Component({
  selector: 'm-delete-environment-dialog',
  templateUrl: './delete-environment-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class DeleteEnvironmentDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  dataItem: DeleteEnvironmentDialogData = this.ref.data;

  constructor(
    public ref: DialogRef<DeleteEnvironmentDialogData>,
    private memberQuery: MemberQuery,
    private navQuery: NavQuery,
    private environmentsQuery: EnvironmentsQuery
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    this.ref.close();

    let payload: ToBackendDeleteEnvRequestPayload = {
      projectId: this.dataItem.projectId,
      envId: this.dataItem.envId
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendDeleteEnv,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendDeleteEnvResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);
            this.environmentsQuery.update({ environments: resp.payload.envs });

            let nav = this.navQuery.getValue();

            if (nav.envId === this.dataItem.envId) {
              this.navQuery.updatePart({
                envId: PROJECT_ENV_PROD,
                needValidate: false
              });
            }
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
