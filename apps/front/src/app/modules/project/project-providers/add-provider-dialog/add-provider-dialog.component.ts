import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import {
  type AbstractControl,
  FormArray,
  FormBuilder,
  type FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ProviderKindEnum } from '#common/enums/provider-kind.enum';
import { ProviderLlmTypeEnum } from '#common/enums/provider-llm-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { LlmOpenAICompatibleOptions } from '#common/zod/backend/provider-parts/llm-openai-compatible-options';
import type {
  ToBackendCreateProviderRequestPayload,
  ToBackendCreateProviderResponse
} from '#common/zod/to-backend/providers/to-backend-create-provider';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { ProvidersQuery } from '#front/app/queries/providers.query';
import { ApiService } from '#front/app/services/api.service';
import { ValidationService } from '#front/app/services/validation.service';

export interface AddProviderDialogData {
  apiService: ApiService;
  projectId: string;
}

@Component({
  selector: 'm-add-provider-dialog',
  templateUrl: './add-provider-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class AddProviderDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  addProviderForm: FormGroup;

  constructor(
    public ref: DialogRef<AddProviderDialogData>,
    private fb: FormBuilder,
    private providersQuery: ProvidersQuery
  ) {}

  ngOnInit() {
    this.addProviderForm = this.fb.group({
      providerId: [
        undefined,
        [
          Validators.required,
          ValidationService.connectionNameWrongChars,
          Validators.maxLength(32)
        ]
      ],
      baseURL: [undefined, [Validators.required]],
      apiKey: [undefined],
      headers: this.fb.array([]),
      queryParams: this.fb.array([]),
      models: this.fb.array([this.makeModelGroup({})])
    });
  }

  getHeaders(): FormArray {
    return this.addProviderForm.controls['headers'] as FormArray;
  }

  addHeader() {
    this.getHeaders().push(this.makeKeyValueGroup({}));
  }

  removeHeader(item: { index: number }) {
    let { index } = item;
    this.getHeaders().removeAt(index);
  }

  getQueryParams(): FormArray {
    return this.addProviderForm.controls['queryParams'] as FormArray;
  }

  addQueryParam() {
    this.getQueryParams().push(this.makeKeyValueGroup({}));
  }

  removeQueryParam(item: { index: number }) {
    let { index } = item;
    this.getQueryParams().removeAt(index);
  }

  getModels(): FormArray {
    return this.addProviderForm.controls['models'] as FormArray;
  }

  addModel() {
    this.getModels().push(this.makeModelGroup({}));
  }

  removeModel(item: { index: number }) {
    let { index } = item;
    this.getModels().removeAt(index);
  }

  getControl(item: {
    group: AbstractControl;
    controlName: string;
  }): AbstractControl {
    let { group, controlName } = item;
    return group.get(controlName);
  }

  add() {
    this.addProviderForm.markAllAsTouched();

    if (!this.addProviderForm.valid) {
      return;
    }

    let options: LlmOpenAICompatibleOptions = {
      baseURL: this.addProviderForm.value.baseURL.trim(),
      apiKey: this.addProviderForm.value.apiKey?.trim() || undefined,
      headers: this.addProviderForm.value.headers.map(
        (header: { key: string; value: string }) => ({
          key: header.key.trim(),
          value: header.value
        })
      ),
      queryParams: this.addProviderForm.value.queryParams.map(
        (queryParam: { key: string; value: string }) => ({
          key: queryParam.key.trim(),
          value: queryParam.value
        })
      ),
      includeUsage: true,
      supportsStructuredOutputs: true,
      models: this.addProviderForm.value.models.map(
        (model: { modelId: string; name?: string }) => ({
          modelId: model.modelId.trim(),
          name: model.name?.trim() || undefined
        })
      )
    };

    let payload: ToBackendCreateProviderRequestPayload = {
      projectId: this.ref.data.projectId,
      providerId: this.addProviderForm.value.providerId.trim(),
      kind: ProviderKindEnum.LLM,
      type: ProviderLlmTypeEnum.OpenAICompatible,
      isEnabled: true,
      options: options
    };

    this.ref.close();

    this.ref.data.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCreateProvider,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendCreateProviderResponse) => {
          if (resp.info?.status !== ResponseInfoStatusEnum.Ok) {
            return;
          }

          let providers = this.providersQuery.getValue().providers;
          let newProviders = [...providers, resp.payload.provider].sort(
            (a, b) =>
              a.providerId > b.providerId
                ? 1
                : b.providerId > a.providerId
                  ? -1
                  : 0
          );

          this.providersQuery.update({
            providers: newProviders
          });
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }

  private makeKeyValueGroup(item: {
    key?: string;
    value?: string;
    isValueRequired?: boolean;
  }) {
    let { key, value, isValueRequired = true } = item;
    return this.fb.group({
      key: [key, [Validators.required]],
      value: [value, isValueRequired === true ? [Validators.required] : []]
    });
  }

  private makeModelGroup(item: { modelId?: string; name?: string }) {
    let { modelId, name } = item;

    return this.fb.group({
      modelId: [modelId, [Validators.required]],
      name: [name]
    });
  }
}
