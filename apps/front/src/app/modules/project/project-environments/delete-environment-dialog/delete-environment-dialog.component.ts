import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import type { ToBackendDeleteEnvOutput } from '#common/types/backend/routes/envs/delete-env/delete-env-output';
import type { ToBackendDeleteEnvRequest } from '#common/types/backend/routes/envs/delete-env/delete-env-request';
import { EnvironmentsQuery } from '#front/app/queries/environments.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery, type NavState } from '#front/app/queries/nav.query';
import { ApiService } from '#front/app/services/api.service';
import { AppSpinnerService } from '#front/app/services/app-spinner.service';

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
    private appSpinnerService: AppSpinnerService,
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

    let payload: ToBackendDeleteEnvRequest['input'] = {
      projectId: this.dataItem.projectId,
      envId: this.dataItem.envId
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req({
        route: 'api/ToBackendDeleteEnv',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendDeleteEnvOutput = resp.output;

          this.memberQuery.update(output.userMember);

          this.environmentsQuery.update({
            environments: output.envs
          });

          let nav: NavState = this.navQuery.getValue();

          if (nav.envId === this.dataItem.envId) {
            this.navQuery.updatePart({
              envId: PROJECT_ENV_PROD,
              needValidate: false
            });
          }
        }),
        take(1),
        this.appSpinnerService.track()
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
