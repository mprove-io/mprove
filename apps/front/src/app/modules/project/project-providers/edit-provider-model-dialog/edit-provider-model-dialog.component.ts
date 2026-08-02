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
  ReactiveFormsModule
} from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { Provider } from '#common/zod/backend/provider';
import type { LlmModel } from '#common/zod/backend/provider-parts/llm-model';
import type {
  ToBackendEditProviderModelRequestPayload,
  ToBackendEditProviderModelResponse
} from '#common/zod/to-backend/providers/to-backend-edit-provider-model';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { ProvidersQuery } from '#front/app/queries/providers.query';
import { ApiService } from '#front/app/services/api.service';

export interface EditProviderModelDialogData {
  apiService: ApiService;
  provider: Provider;
  model: LlmModel;
}

@Component({
  selector: 'm-edit-provider-model-dialog',
  templateUrl: './edit-provider-model-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class EditProviderModelDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  modelForm: FormGroup;

  constructor(
    public ref: DialogRef<EditProviderModelDialogData>,
    private fb: FormBuilder,
    private providersQuery: ProvidersQuery
  ) {}

  ngOnInit() {
    this.modelForm = this.fb.group({
      name: [this.ref.data.model.name]
    });
  }

  save() {
    this.modelForm.markAllAsTouched();

    if (!this.modelForm.valid) {
      return;
    }

    let provider = this.ref.data.provider;

    let payload: ToBackendEditProviderModelRequestPayload = {
      projectId: provider.projectId,
      providerId: provider.providerId,
      modelId: this.ref.data.model.modelId,
      name: this.modelForm.value.name?.trim()
    };

    this.ref.close();
    this.ref.data.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendEditProviderModel,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendEditProviderModelResponse) => {
          if (resp.info?.status !== ResponseInfoStatusEnum.Ok) {
            return;
          }

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
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
