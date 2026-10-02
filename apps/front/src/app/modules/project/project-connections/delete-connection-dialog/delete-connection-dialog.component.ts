import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import type { ToBackendDeleteConnectionRequest } from '#common/types/backend/routes/connections/delete-connection/delete-connection-request';
import type { ToBackendDeleteConnectionResponse } from '#common/types/backend/routes/connections/delete-connection/delete-connection-response';
import { ConnectionsQuery } from '#front/app/queries/connections.query';
import { ApiService } from '#front/app/services/api.service';

export interface DeleteConnectionDialogData {
  apiService: ApiService;
  projectId: string;
  envId: string;
  connectionId: string;
}

@Component({
  selector: 'm-delete-connection-dialog',
  templateUrl: './delete-connection-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class DeleteConnectionDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  dataItem: DeleteConnectionDialogData = this.ref.data;

  constructor(
    public ref: DialogRef<DeleteConnectionDialogData>,
    private connectionsQuery: ConnectionsQuery
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    this.ref.close();

    let payload: ToBackendDeleteConnectionRequest['input'] = {
      projectId: this.dataItem.projectId,
      envId: this.dataItem.envId,
      connectionId: this.dataItem.connectionId
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req({
        route: 'api/ToBackendDeleteConnection',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendDeleteConnectionResponse) => {
          if (resp?.type === 'Success') {
            let connectionsState = this.connectionsQuery.getValue();
            this.connectionsQuery.update({
              connections: connectionsState.connections.filter(
                x =>
                  x.projectId !== this.dataItem.projectId ||
                  x.envId !== this.dataItem.envId ||
                  x.connectionId !== this.dataItem.connectionId
              )
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
