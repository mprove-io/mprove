import { Component, HostListener, OnInit } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import {
  ConnectionsState,
  ConnectionsStore
} from '~front/app/stores/connections.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface DeleteConnectionDialogData {
  apiService: ApiService;
  projectId: string;
  envId: string;
  connectionId: string;
}

@Component({
  selector: 'm-delete-connection-dialog',
  templateUrl: './delete-connection-dialog.component.html'
})
export class DeleteConnectionDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  dataItem: DeleteConnectionDialogData = this.ref.data;

  constructor(
    public ref: DialogRef<DeleteConnectionDialogData>,
    private connectionsStore: ConnectionsStore
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    this.ref.close();

    let payload: apiToBackend.ToBackendDeleteConnectionRequestPayload = {
      projectId: this.dataItem.projectId,
      envId: this.dataItem.envId,
      connectionId: this.dataItem.connectionId
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteConnection,
        payload: payload,
        showSpinner: true
      })
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
