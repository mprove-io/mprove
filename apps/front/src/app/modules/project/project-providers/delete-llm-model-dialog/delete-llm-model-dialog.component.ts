import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import type { LlmModel } from '#common/types/backend/llm-models/llm-model';
import type { Provider } from '#common/types/backend/provider';
import type { ToBackendDeleteLlmModelRequest } from '#common/types/backend/routes/llm-models/delete-llm-model/delete-llm-model-request';
import type { ToBackendDeleteLlmModelResponse } from '#common/types/backend/routes/llm-models/delete-llm-model/delete-llm-model-response';
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

    let payload: ToBackendDeleteLlmModelRequest['input'] = {
      projectId: provider.projectId,
      providerId: provider.providerId,
      modelId: this.ref.data.model.modelId
    };

    this.ref.close();

    this.ref.data.apiService
      .req({
        route: 'api/ToBackendDeleteLlmModel',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendDeleteLlmModelResponse) => {
          if (resp?.type !== 'Success') {
            return;
          }

          let provider: Provider = resp.output.provider;

          let providers: Provider[] = this.providersQuery
            .getValue()
            .providers.map(x =>
              x.providerId === provider.providerId ? provider : x
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
