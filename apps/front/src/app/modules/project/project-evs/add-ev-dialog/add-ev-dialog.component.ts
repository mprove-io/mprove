import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { EvsState, EvsStore } from '~front/app/stores/evs.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface AddEvDialogDataItem {
  apiService: any;
  projectId: string;
  envId: string;
}

@Component({
  selector: 'm-add-ev-dialog',
  templateUrl: './add-ev-dialog.component.html'
})
export class AddEvDialogComponent implements OnInit {
  dataItem: AddEvDialogDataItem = this.ref.data;

  addEvForm: FormGroup;

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
    private evsStore: EvsStore
  ) {}

  ngOnInit() {
    this.addEvForm = this.fb.group({
      evId: [undefined, [Validators.required, Validators.maxLength(255)]],
      val: [undefined, [Validators.required, Validators.maxLength(255)]]
    });
  }

  add() {
    this.addEvForm.markAllAsTouched();

    if (!this.addEvForm.valid) {
      return;
    }

    this.ref.close();

    let payload: apiToBackend.ToBackendCreateEvRequestPayload = {
      projectId: this.dataItem.projectId,
      envId: this.dataItem.envId,
      evId: this.addEvForm.value.evId,
      val: this.addEvForm.value.val
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateEv, payload)
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateEvResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let ev = resp.payload.ev;

            this.evsStore.update(
              state =>
                <EvsState>{
                  evs: [...state.evs, ev]
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
