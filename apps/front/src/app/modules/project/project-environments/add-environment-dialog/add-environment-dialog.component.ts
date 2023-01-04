import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { EnvironmentsQuery } from '~front/app/queries/environments.query';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface AddEnvironmentDialogData {
  apiService: ApiService;
  projectId: string;
}

@Component({
  selector: 'm-add-environment-dialog',
  templateUrl: './add-environment-dialog.component.html'
})
export class AddEnvironmentDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild('envId') envIdElement: ElementRef;

  dataItem: AddEnvironmentDialogData = this.ref.data;

  addEnvironmentForm: FormGroup;

  constructor(
    public ref: DialogRef<AddEnvironmentDialogData>,
    private fb: FormBuilder,
    private environmentsQuery: EnvironmentsQuery
  ) {}

  ngOnInit() {
    this.addEnvironmentForm = this.fb.group({
      envId: [undefined, [Validators.required, Validators.maxLength(255)]]
    });

    setTimeout(() => {
      this.envIdElement.nativeElement.focus();
    }, 0);
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
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateEnv,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateEnvResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let environment = resp.payload.env;

            let environmentsState = this.environmentsQuery.getValue();

            this.environmentsQuery.update({
              environments: [...environmentsState.environments, environment],
              total: environmentsState.total
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
