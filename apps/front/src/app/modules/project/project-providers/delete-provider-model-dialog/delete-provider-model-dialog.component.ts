import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { Provider } from '#common/zod/backend/provider';
import type { LlmModel } from '#common/zod/backend/provider-parts/llm-model';
import type {
  ToBackendDeleteProviderModelRequestPayload,
  ToBackendDeleteProviderModelResponse
} from '#common/zod/to-backend/providers/to-backend-delete-provider-model';
import { ProvidersQuery } from '#front/app/queries/providers.query';
import { ApiService } from '#front/app/services/api.service';

export interface DeleteProviderModelDialogData {
  apiService: ApiService;
  provider: Provider;
  model: LlmModel;
}

@Component({
  selector: 'm-delete-provider-model-dialog',
  templateUrl: './delete-provider-model-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class DeleteProviderModelDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  constructor(
    public ref: DialogRef<DeleteProviderModelDialogData>,
    private providersQuery: ProvidersQuery
  ) {}

  ngOnInit() {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    let provider = this.ref.data.provider;

    let payload: ToBackendDeleteProviderModelRequestPayload = {
      projectId: provider.projectId,
      providerId: provider.providerId,
      modelId: this.ref.data.model.modelId
    };

    this.ref.close();

    this.ref.data.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendDeleteProviderModel,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendDeleteProviderModelResponse) => {
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
