import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import {
  type FormArray,
  FormBuilder,
  type FormControl,
  type FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { PROVIDER_TYPE_NAME_BY_TYPE } from '#common/constants/providers';
import type { ProviderOptionsOpenAICompatible } from '#common/types/backend/parts/provider/options/provider-options-openai-compatible';
import type { Provider } from '#common/types/backend/parts/provider/provider';
import type { ToBackendEditProviderRequest } from '#common/types/backend/routes/providers/edit-provider/edit-provider-request';
import type { ToBackendEditProviderResponse } from '#common/types/backend/routes/providers/edit-provider/edit-provider-response';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { ProvidersQuery } from '#front/app/queries/providers.query';
import { ApiService } from '#front/app/services/api.service';
import { ValidationService } from '#front/app/services/validation.service';
import type { KeyValueFormControls } from '#front/app/types/forms/key-value-form-controls';

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

  editProviderForm: FormGroup<{
    name: FormControl<string>;
    baseURL: FormControl<string>;
    apiKey: FormControl<string>;
    headers: FormArray<FormGroup<KeyValueFormControls>>;
    queryParams: FormArray<FormGroup<KeyValueFormControls>>;
  }>;

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

    let isOpenAICompatible = provider.type === 'OpenAICompatible';

    let compatibleOptions = isOpenAICompatible
      ? (provider.options as ProviderOptionsOpenAICompatible)
      : undefined;

    let headerGroups: FormGroup<KeyValueFormControls>[] = compatibleOptions
      ? (compatibleOptions.headers ?? []).map(header =>
          this.makeKeyValueGroup({
            key: header.key,
            value: header.value,
            isValueRequired: false
          })
        )
      : [];

    let queryParamGroups: FormGroup<KeyValueFormControls>[] = compatibleOptions
      ? (compatibleOptions.queryParams ?? []).map(queryParam =>
          this.makeKeyValueGroup({
            key: queryParam.key,
            value: queryParam.value
          })
        )
      : [];

    this.editProviderForm = this.fb.group({
      name: this.fb.control<string>(
        provider.name,
        isOpenAICompatible
          ? [Validators.required, Validators.maxLength(100)]
          : []
      ),
      baseURL: this.fb.control<string>(
        compatibleOptions?.baseURL,
        isOpenAICompatible
          ? [
              Validators.required,
              ValidationService.apiUrlValidator,
              ValidationService.openAiCompatibleBaseUrlValidator
            ]
          : []
      ),
      apiKey: this.fb.control<string>(
        undefined,
        provider.type === 'OpenAI' || provider.type === 'Anthropic'
          ? [Validators.required]
          : []
      ),
      headers: this.fb.array(headerGroups),
      queryParams: this.fb.array(queryParamGroups)
    });
  }

  getHeaders(): FormArray<FormGroup<KeyValueFormControls>> {
    let headers: FormArray<FormGroup<KeyValueFormControls>> =
      this.editProviderForm.controls['headers'];

    return headers;
  }

  addHeader() {
    this.getHeaders().push(this.makeKeyValueGroup({}));
  }

  removeHeader(item: { index: number }) {
    let { index } = item;
    this.getHeaders().removeAt(index);
  }

  getQueryParams(): FormArray<FormGroup<KeyValueFormControls>> {
    let queryParams: FormArray<FormGroup<KeyValueFormControls>> =
      this.editProviderForm.controls['queryParams'];

    return queryParams;
  }

  addQueryParam() {
    this.getQueryParams().push(this.makeKeyValueGroup({}));
  }

  removeQueryParam(item: { index: number }) {
    let { index } = item;
    this.getQueryParams().removeAt(index);
  }

  getControl(item: {
    group: FormGroup<KeyValueFormControls>;
    controlName: keyof KeyValueFormControls;
  }): FormControl<string> {
    let { group, controlName } = item;

    let control: FormControl<string> = group.controls[controlName];

    return control;
  }

  save() {
    this.editProviderForm.markAllAsTouched();

    if (!this.editProviderForm.valid) {
      return;
    }

    let provider = this.ref.data.provider;

    let payload: ToBackendEditProviderRequest['input'];

    if (provider.type === 'OpenAICompatible') {
      payload = {
        name: this.editProviderForm.value.name.trim(),
        projectId: this.ref.data.projectId,
        providerId: provider.providerId,
        options: {
          baseURL: this.editProviderForm.value.baseURL.trim(),
          apiKey: this.editProviderForm.value.apiKey?.trim() || undefined,
          headers: this.editProviderForm.value.headers.map(header => ({
            key: header.key.trim(),
            value: header.value
          })),
          queryParams: this.editProviderForm.value.queryParams.map(
            queryParam => ({
              key: queryParam.key.trim(),
              value: queryParam.value
            })
          )
        }
      };
    } else if (provider.type === 'OpenAICodex') {
      payload = {
        projectId: this.ref.data.projectId,
        providerId: provider.providerId,
        options: {}
      };
    } else if (provider.type === 'OpenAI') {
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
        route: 'api/ToBackendEditProvider',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendEditProviderResponse) => {
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

  private makeKeyValueGroup(item: {
    key?: string;
    value?: string;
    isValueRequired?: boolean;
  }): FormGroup<KeyValueFormControls> {
    let { key, value, isValueRequired = true } = item;

    let group: FormGroup<KeyValueFormControls> = this.fb.group({
      key: this.fb.control<string>(key, [Validators.required]),
      value: this.fb.control<string>(
        value,
        isValueRequired === true ? [Validators.required] : []
      )
    });

    return group;
  }
}
