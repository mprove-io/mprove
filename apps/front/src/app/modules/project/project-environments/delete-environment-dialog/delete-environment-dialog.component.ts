import { Component, HostListener, OnInit } from '@angular/core';
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
  apiService: ApiService;
  projectId: string;
  envId: string;
  // pageNum: number;
  // getEnvsPageFn?: any;
}

@Component({
  selector: 'm-delete-environment-dialog',
  templateUrl: './delete-environment-dialog.component.html'
})
export class DeleteEnvironmentDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  dataItem: DeleteEnvironmentDialogDataItem = this.ref.data;

  constructor(
    public ref: DialogRef<DeleteEnvironmentDialogDataItem>,
    private environmentsStore: EnvironmentsStore
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
