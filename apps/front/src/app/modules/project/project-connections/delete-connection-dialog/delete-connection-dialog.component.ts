import { Component } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import {
  ConnectionsState,
  ConnectionsStore
} from '~front/app/stores/connections.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface DeleteConnectionDialogDataItem {
  apiService: ApiService;
  projectId: string;
  envId: string;
  connectionId: string;
}

@Component({
  selector: 'm-delete-connection-dialog',
  templateUrl: './delete-connection-dialog.component.html'
})
export class DeleteConnectionDialogComponent {
  dataItem: DeleteConnectionDialogDataItem = this.ref.data;

  constructor(
    public ref: DialogRef<DeleteConnectionDialogDataItem>,
    private connectionsStore: ConnectionsStore
  ) {}

  delete() {
    this.ref.close();

    let payload: apiToBackend.ToBackendDeleteConnectionRequestPayload = {
      projectId: this.dataItem.projectId,
      envId: this.dataItem.envId,
      connectionId: this.dataItem.connectionId
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteConnection,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteConnectionResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.connectionsStore.update(
              state =>
                <ConnectionsState>{
                  connections: state.connections.filter(
                    x =>
                      x.projectId !== this.dataItem.projectId ||
                      x.envId !== this.dataItem.envId ||
                      x.connectionId !== this.dataItem.connectionId
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
