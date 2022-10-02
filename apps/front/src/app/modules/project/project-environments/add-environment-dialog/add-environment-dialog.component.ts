import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import {
  EnvironmentsState,
  EnvironmentsStore
} from '~front/app/stores/environments.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface AddEnvironmentDialogDataItem {
  apiService: ApiService;
  projectId: string;
}

@Component({
  selector: 'm-add-environment-dialog',
  templateUrl: './add-environment-dialog.component.html'
})
export class AddEnvironmentDialogComponent implements OnInit {
  dataItem: AddEnvironmentDialogDataItem = this.ref.data;

  addEnvironmentForm: FormGroup;

  constructor(
    public ref: DialogRef<AddEnvironmentDialogDataItem>,
    private fb: FormBuilder,
    private environmentsStore: EnvironmentsStore
  ) {}

  ngOnInit() {
    this.addEnvironmentForm = this.fb.group({
      envId: [undefined, [Validators.required, Validators.maxLength(255)]]
    });
  }

  add() {
    this.addEnvironmentForm.markAllAsTouched();

    if (!this.addEnvironmentForm.valid) {
      return;
    }

    this.ref.close();

    let payload: apiToBackend.ToBackendCreateEnvRequestPayload = {
      projectId: this.dataItem.projectId,
      envId: this.addEnvironmentForm.value.envId
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateEnv,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateEnvResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let environment = resp.payload.env;

            this.environmentsStore.update(
              state =>
                <EnvironmentsState>{
                  environments: [...state.environments, environment],
                  total: state.total
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
