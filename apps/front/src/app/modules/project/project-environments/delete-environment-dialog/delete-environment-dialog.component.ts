import { Component } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import {
  EnvironmentsState,
  EnvironmentsStore
} from '~front/app/stores/environments.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface DeleteEnvironmentDialogDataItem {
  apiService: any;
  projectId: string;
  envId: string;
  // pageNum: number;
  // getEnvsPageFn?: any;
}

@Component({
  selector: 'm-delete-environment-dialog',
  templateUrl: './delete-environment-dialog.component.html'
})
export class DeleteEnvironmentDialogComponent {
  dataItem: DeleteEnvironmentDialogDataItem = this.ref.data;

  constructor(
    public ref: DialogRef,
    private environmentsStore: EnvironmentsStore
  ) {}

  delete() {
    this.ref.close();

    let payload: apiToBackend.ToBackendDeleteEnvRequestPayload = {
      projectId: this.dataItem.projectId,
      envId: this.dataItem.envId
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteEnv,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteEnvResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            // this.dataItem.getEnvsPageFn(this.dataItem.pageNum);
            this.environmentsStore.update(
              state =>
                <EnvironmentsState>{
                  environments: state.environments.filter(
                    x =>
                      !(
                        x.projectId === this.dataItem.projectId &&
                        x.envId === this.dataItem.envId
                      )
                  )
                }
            );
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
