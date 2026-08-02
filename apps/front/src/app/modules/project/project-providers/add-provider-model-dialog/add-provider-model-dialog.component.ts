import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  type FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { Provider } from '#common/zod/backend/provider';
import type {
  ToBackendAddProviderModelRequestPayload,
  ToBackendAddProviderModelResponse
} from '#common/zod/to-backend/providers/to-backend-add-provider-model';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { ProvidersQuery } from '#front/app/queries/providers.query';
import { ApiService } from '#front/app/services/api.service';

export interface AddProviderModelDialogData {
  apiService: ApiService;
  provider: Provider;
}

@Component({
  selector: 'm-add-provider-model-dialog',
  templateUrl: './add-provider-model-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class AddProviderModelDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  modelForm: FormGroup;

  constructor(
    public ref: DialogRef<AddProviderModelDialogData>,
    private fb: FormBuilder,
    private providersQuery: ProvidersQuery
  ) {}

  ngOnInit() {
    this.modelForm = this.fb.group({
      modelId: [undefined, [Validators.required]],
      name: [undefined]
    });
  }

  save() {
    this.modelForm.markAllAsTouched();

    if (!this.modelForm.valid) {
      return;
    }

    let provider = this.ref.data.provider;

    let payload: ToBackendAddProviderModelRequestPayload = {
      projectId: provider.projectId,
      providerId: provider.providerId,
      model: {
        modelId: this.modelForm.value.modelId.trim(),
        name: this.modelForm.value.name?.trim()
      }
    };

    this.ref.close();

    this.ref.data.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendAddProviderModel,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendAddProviderModelResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let providers = this.providersQuery
              .getValue()
              .providers.map(x =>
                x.providerId === resp.payload.provider.providerId
                  ? resp.payload.provider
                  : x
              );

            this.providersQuery.update({
              providers: providers
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
