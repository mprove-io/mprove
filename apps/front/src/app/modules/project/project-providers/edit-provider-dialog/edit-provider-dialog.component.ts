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
import { PROVIDER_TYPE_NAME_BY_TYPE } from '#common/constants/providers';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { Provider } from '#common/zod/backend/provider';
import type { ProviderOptionsOpenAICompatible } from '#common/zod/backend/provider-options/provider-options-openai-compatible';
import type { ToBackendEditProviderRequestPayload } from '#common/zod/to-backend/providers/edit-provider/edit-provider-request-payload';
import type { ToBackendEditProviderResponse } from '#common/zod/to-backend/providers/edit-provider/edit-provider-response';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { ProvidersQuery } from '#front/app/queries/providers.query';
import { ApiService } from '#front/app/services/api.service';
import { ValidationService } from '#front/app/services/validation.service';

export interface EditProviderDialogData {
  apiService: ApiService;
  projectId: string;
  provider: Provider;
}

@Component({
  selector: 'm-edit-provider-dialog',
  templateUrl: './edit-provider-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class EditProviderDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  editProviderForm: FormGroup;

  providerTypeEnum = ProviderTypeEnum;

  get providerTypeLabel(): string {
    let providerTypeLabel: string =
      PROVIDER_TYPE_NAME_BY_TYPE[this.ref.data.provider.type];

    return providerTypeLabel;
  }

  constructor(
    public ref: DialogRef<EditProviderDialogData>,
    private fb: FormBuilder,
    private providersQuery: ProvidersQuery
  ) {}

  ngOnInit() {
    let provider = this.ref.data.provider;

    let isOpenAICompatible =
      provider.type === ProviderTypeEnum.OpenAICompatible;

    let compatibleOptions = isOpenAICompatible
      ? (provider.options as ProviderOptionsOpenAICompatible)
      : undefined;

    let headerGroups = compatibleOptions
      ? (compatibleOptions.headers ?? []).map(header =>
          this.makeKeyValueGroup({
            key: header.key,
            value: header.value,
            isValueRequired: false
          })
        )
      : [];

    let queryParamGroups = compatibleOptions
      ? (compatibleOptions.queryParams ?? []).map(queryParam =>
          this.makeKeyValueGroup({
            key: queryParam.key,
            value: queryParam.value
          })
        )
      : [];

    this.editProviderForm = this.fb.group({
      name: [
        provider.name,
        isOpenAICompatible
          ? [Validators.required, Validators.maxLength(100)]
          : []
      ],
      baseURL: [
        compatibleOptions?.baseURL,
        isOpenAICompatible
          ? [
              Validators.required,
              ValidationService.apiUrlValidator,
              ValidationService.openAiCompatibleBaseUrlValidator
            ]
          : []
      ],
      apiKey: [
        undefined,
        provider.type === ProviderTypeEnum.OpenAI ||
        provider.type === ProviderTypeEnum.Anthropic
          ? [Validators.required]
          : []
      ],
      headers: this.fb.array(headerGroups),
      queryParams: this.fb.array(queryParamGroups)
    });
  }

  getHeaders(): FormArray {
    return this.editProviderForm.controls['headers'] as FormArray;
  }

  addHeader() {
    this.getHeaders().push(this.makeKeyValueGroup({}));
  }

  removeHeader(item: { index: number }) {
    let { index } = item;
    this.getHeaders().removeAt(index);
  }

  getQueryParams(): FormArray {
    return this.editProviderForm.controls['queryParams'] as FormArray;
  }

  addQueryParam() {
    this.getQueryParams().push(this.makeKeyValueGroup({}));
  }

  removeQueryParam(item: { index: number }) {
    let { index } = item;
    this.getQueryParams().removeAt(index);
  }

  getControl(item: {
    group: AbstractControl;
    controlName: string;
  }): AbstractControl {
    let { group, controlName } = item;
    return group.get(controlName);
  }

  save() {
    this.editProviderForm.markAllAsTouched();

    if (!this.editProviderForm.valid) {
      return;
    }

    let provider = this.ref.data.provider;

    let payload: ToBackendEditProviderRequestPayload;

    if (provider.type === ProviderTypeEnum.OpenAICompatible) {
      payload = {
        name: this.editProviderForm.value.name.trim(),
        projectId: this.ref.data.projectId,
        providerId: provider.providerId,
        options: {
          baseURL: this.editProviderForm.value.baseURL.trim(),
          apiKey: this.editProviderForm.value.apiKey?.trim() || undefined,
          headers: this.editProviderForm.value.headers.map(
            (header: { key: string; value: string }) => ({
              key: header.key.trim(),
              value: header.value
            })
          ),
          queryParams: this.editProviderForm.value.queryParams.map(
            (queryParam: { key: string; value: string }) => ({
              key: queryParam.key.trim(),
              value: queryParam.value
            })
          )
        }
      };
    } else if (provider.type === ProviderTypeEnum.OpenAICodex) {
      payload = {
        projectId: this.ref.data.projectId,
        providerId: provider.providerId,
        options: {}
      };
    } else if (provider.type === ProviderTypeEnum.OpenAI) {
      payload = {
        projectId: this.ref.data.projectId,
        providerId: provider.providerId,
        options: {
          apiKey: this.editProviderForm.value.apiKey?.trim() || undefined
        }
      };
    } else {
      payload = {
        projectId: this.ref.data.projectId,
        providerId: provider.providerId,
        options: {
          apiKey: this.editProviderForm.value.apiKey?.trim() || undefined
        }
      };
    }

    this.ref.close();

    this.ref.data.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendEditProvider,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendEditProviderResponse) => {
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
}
