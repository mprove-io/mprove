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
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { Provider } from '#common/zod/backend/provider';
import type { LlmOpenAICompatibleOptions } from '#common/zod/backend/provider-parts/llm-openai-compatible-options';
import type {
  ToBackendEditProviderRequestPayload,
  ToBackendEditProviderResponse
} from '#common/zod/to-backend/providers/to-backend-edit-provider';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { ProvidersQuery } from '#front/app/queries/providers.query';
import { ApiService } from '#front/app/services/api.service';

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

  constructor(
    public ref: DialogRef<EditProviderDialogData>,
    private fb: FormBuilder,
    private providersQuery: ProvidersQuery
  ) {}

  ngOnInit() {
    let provider = this.ref.data.provider;
    let headerGroups = (provider.options.headers ?? []).map(header =>
      this.makeKeyValueGroup({
        key: header.key,
        value: header.value,
        isValueRequired: false
      })
    );
    let queryParamGroups = (provider.options.queryParams ?? []).map(
      queryParam =>
        this.makeKeyValueGroup({
          key: queryParam.key,
          value: queryParam.value
        })
    );

    this.editProviderForm = this.fb.group({
      baseURL: [provider.options.baseURL, [Validators.required]],
      apiKey: [undefined],
      isEnabled: [provider.isEnabled],
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
    let options: LlmOpenAICompatibleOptions = {
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
      ),
      models: provider.options.models
    };
    let payload: ToBackendEditProviderRequestPayload = {
      projectId: this.ref.data.projectId,
      providerId: provider.providerId,
      isEnabled: this.editProviderForm.value.isEnabled,
      options: options
    };

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
