import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { EvsQuery } from '~front/app/queries/evs.query';
import { ApiService } from '~front/app/services/api.service';
import { ValidationService } from '~front/app/services/validation.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface AddEvDialogData {
  apiService: ApiService;
  projectId: string;
  envId: string;
}

@Component({
  selector: 'm-add-ev-dialog',
  templateUrl: './add-ev-dialog.component.html'
})
export class AddEvDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  dataItem: AddEvDialogData = this.ref.data;

  addEvForm: FormGroup;

  constructor(
    public ref: DialogRef<AddEvDialogData>,
    private fb: FormBuilder,
    private evsQuery: EvsQuery
  ) {}

  ngOnInit() {
    this.addEvForm = this.fb.group({
      evId: [
        undefined,
        [
          Validators.required,
          ValidationService.envVariableNameWrongChars,
          Validators.maxLength(128)
        ]
      ],
      val: [undefined, [Validators.required, Validators.maxLength(255)]]
    });

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
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
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateEv,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateEvResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let ev = resp.payload.ev;

            let evsState = this.evsQuery.getValue();
            this.evsQuery.updatePart({
              evs: [...evsState.evs, ev]
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
