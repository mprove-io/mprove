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

@Component({
  selector: 'm-delete-connection-dialog',
  templateUrl: './delete-connection-dialog.component.html'
})
export class DeleteConnectionDialogComponent {
  constructor(
    public ref: DialogRef,
    private connectionsStore: ConnectionsStore
  ) {}

  delete() {
    this.ref.close();

    let payload: apiToBackend.ToBackendDeleteConnectionRequestPayload = {
      projectId: this.ref.data.projectId,
      connectionId: this.ref.data.connectionId
    };

    let apiService: ApiService = this.ref.data.apiService;

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
                      x.connectionId !== this.ref.data.connectionId ||
                      x.projectId !== this.ref.data.projectId
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
