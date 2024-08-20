import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { EnvironmentsQuery } from '~front/app/queries/environments.query';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface DeleteEnvironmentDialogData {
  apiService: ApiService;
  projectId: string;
  envId: string;
  // pageNum: number;
  // getEnvsPageFn?: any;
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
    private environmentsQuery: EnvironmentsQuery
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    this.ref.close();

    let payload: apiToBackend.ToBackendDeleteEnvRequestPayload = {
      projectId: this.dataItem.projectId,
      envId: this.dataItem.envId
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteEnv,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteEnvResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            // this.dataItem.getEnvsPageFn(this.dataItem.pageNum);

            let environmentsState = this.environmentsQuery.getValue();

            this.environmentsQuery.update({
              environments: environmentsState.environments.filter(
                x =>
                  !(
                    x.projectId === this.dataItem.projectId &&
                    x.envId === this.dataItem.envId
                  )
              ),
              total: environmentsState.total
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
