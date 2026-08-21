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
import type { LlmModel } from '#common/zod/backend/llm-models/llm-model';
import type { Provider } from '#common/zod/backend/provider';
import type { ToBackendDeleteLlmModelRequestPayload } from '#common/zod/to-backend/llm-models/delete-llm-model/delete-llm-model-request-payload';
import type { ToBackendDeleteLlmModelResponse } from '#common/zod/to-backend/llm-models/delete-llm-model/delete-llm-model-response';
import { ProvidersQuery } from '#front/app/queries/providers.query';
import { ApiService } from '#front/app/services/api.service';

export interface DeleteLlmModelDialogData {
  apiService: ApiService;
  provider: Provider;
  model: LlmModel;
}

@Component({
  selector: 'm-delete-llm-model-dialog',
  templateUrl: './delete-llm-model-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class DeleteLlmModelDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  constructor(
    public ref: DialogRef<DeleteLlmModelDialogData>,
    private providersQuery: ProvidersQuery
  ) {}

  ngOnInit() {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    let provider = this.ref.data.provider;

    let payload: ToBackendDeleteLlmModelRequestPayload = {
      projectId: provider.projectId,
      providerId: provider.providerId,
      modelId: this.ref.data.model.modelId
    };

    this.ref.close();

    this.ref.data.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendDeleteLlmModel,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendDeleteLlmModelResponse) => {
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

          this.providersQuery.updatePart({
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
