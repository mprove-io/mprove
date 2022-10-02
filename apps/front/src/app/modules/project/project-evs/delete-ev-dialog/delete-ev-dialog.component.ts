import { Component } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { EvsState, EvsStore } from '~front/app/stores/evs.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface DeleteEvDialogDataItem {
  apiService: ApiService;
  ev: common.Ev;
}

@Component({
  selector: 'm-delete-ev-dialog',
  templateUrl: './delete-ev-dialog.component.html'
})
export class DeleteEvDialogComponent {
  dataItem: DeleteEvDialogDataItem = this.ref.data;

  constructor(
    public ref: DialogRef<DeleteEvDialogDataItem>,
    private evsStore: EvsStore
  ) {}

  delete() {
    this.ref.close();

    let payload: apiToBackend.ToBackendDeleteEvRequestPayload = {
      projectId: this.dataItem.ev.projectId,
      envId: this.dataItem.ev.envId,
      evId: this.dataItem.ev.evId
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteEv, payload)
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteEvResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.evsStore.update(
              state =>
                <EvsState>{
                  evs: state.evs.filter(
                    x =>
                      x.projectId !== this.dataItem.ev.projectId ||
                      x.envId !== this.dataItem.ev.envId ||
                      x.evId !== this.dataItem.ev.evId
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
