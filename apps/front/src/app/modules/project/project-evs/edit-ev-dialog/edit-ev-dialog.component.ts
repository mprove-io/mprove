import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { EvsState, EvsStore } from '~front/app/stores/evs.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface EditEvDialogData {
  apiService: ApiService;
  ev: common.Ev;
  i: number;
}

@Component({
  selector: 'm-edit-ev-dialog',
  templateUrl: './edit-ev-dialog.component.html'
})
export class EditEvDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  dataItem: EditEvDialogData = this.ref.data;

  editEvForm: FormGroup;

  constructor(
    public ref: DialogRef<EditEvDialogData>,
    private fb: FormBuilder,
    private evsStore: EvsStore
  ) {}

  ngOnInit() {
    this.editEvForm = this.fb.group({
      val: [
        this.dataItem.ev.val,
        [Validators.required, Validators.maxLength(255)]
      ]
    });

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  edit() {
    this.editEvForm.markAllAsTouched();

    if (!this.editEvForm.valid) {
      return;
    }

    this.ref.close();

    let payload: apiToBackend.ToBackendEditEvRequestPayload = {
      projectId: this.dataItem.ev.projectId,
      envId: this.dataItem.ev.envId,
      evId: this.dataItem.ev.evId,
      val: this.editEvForm.value.val
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req({
        pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditEv,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendEditEvResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.evsStore.update(state => {
              state.evs[this.dataItem.i] = resp.payload.ev;

              return <EvsState>{
                evs: [...state.evs]
              };
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
