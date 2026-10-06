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
import { NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { TippyDirective } from '@ngneat/helipopper';
import { take, tap } from 'rxjs/operators';
import {
  ANTHROPIC_PROVIDER_ID,
  ANTHROPIC_PROVIDER_NAME,
  CODEX_PROVIDER_ID,
  CODEX_PROVIDER_NAME,
  OPENAI_PROVIDER_ID,
  OPENAI_PROVIDER_NAME,
  PROVIDER_TYPE_NAME_BY_TYPE
} from '#common/constants/providers';
import type { Provider } from '#common/types/backend/parts/provider/provider';
import type { ProviderType } from '#common/types/backend/parts/provider/provider-type';
import type { ToBackendCreateProviderRequest } from '#common/types/backend/routes/providers/create-provider/create-provider-request';
import type { ToBackendCreateProviderResponse } from '#common/types/backend/routes/providers/create-provider/create-provider-response';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { ProvidersQuery } from '#front/app/queries/providers.query';
import { ApiService } from '#front/app/services/api.service';
import { ValidationService } from '#front/app/services/validation.service';

export interface AddProviderDialogData {
  apiService: ApiService;
  projectId: string;
}

type SelectableProviderType = {
  value: ProviderType;
  label: string;
  disabled: boolean;
  isAlreadySelected: boolean;
};

type ProviderKeyValueControls = {
  key: FormControl<string>;
  value: FormControl<string>;
};

type AddProviderFormValue = {
  type: ProviderType;
  name: string;
  providerId: string;
  baseURL: string;
  apiKey: string;
  headers: { key: string; value: string }[];
  queryParams: { key: string; value: string }[];
};

@Component({
  selector: 'm-add-provider-dialog',
  templateUrl: './add-provider-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    NgSelectModule,
    TippyDirective
  ]
})
export class AddProviderDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  addProviderForm: FormGroup<{
    type: FormControl<ProviderType>;
    name: FormControl<string>;
    providerId: FormControl<string>;
    baseURL: FormControl<string>;
    apiKey: FormControl<string>;
    headers: FormArray<FormGroup<ProviderKeyValueControls>>;
    queryParams: FormArray<FormGroup<ProviderKeyValueControls>>;
  }>;

  providerTypes: SelectableProviderType[] = [];

  constructor(
    public ref: DialogRef<AddProviderDialogData>,
    private fb: FormBuilder,
    private providersQuery: ProvidersQuery
  ) {}

  ngOnInit() {
    let providers: Provider[] = this.providersQuery
      .getValue()
      .providers.filter(
        provider => provider.projectId === this.ref.data.projectId
      );

    let isAnthropicAlreadySelected: boolean = providers.some(
      provider => provider.type === 'Anthropic'
    );

    let isOpenAIAlreadySelected: boolean = providers.some(
      provider => provider.type === 'OpenAI'
    );

    let isOpenAICodexAlreadySelected: boolean = providers.some(
      provider => provider.type === 'OpenAICodex'
    );

    this.providerTypes = [
      {
        value: 'Anthropic',
        label: PROVIDER_TYPE_NAME_BY_TYPE['Anthropic' satisfies ProviderType],
        disabled: isAnthropicAlreadySelected,
        isAlreadySelected: isAnthropicAlreadySelected
      },
      {
        value: 'OpenAI',
        label: PROVIDER_TYPE_NAME_BY_TYPE['OpenAI' satisfies ProviderType],
        disabled: isOpenAIAlreadySelected,
        isAlreadySelected: isOpenAIAlreadySelected
      },
      {
        value: 'OpenAICodex',
        label: PROVIDER_TYPE_NAME_BY_TYPE['OpenAICodex' satisfies ProviderType],
        disabled: isOpenAICodexAlreadySelected,
        isAlreadySelected: isOpenAICodexAlreadySelected
      },
      {
        value: 'OpenAICompatible',
        label:
          PROVIDER_TYPE_NAME_BY_TYPE['OpenAICompatible' satisfies ProviderType],
        disabled: false,
        isAlreadySelected: false
      }
    ];

    let initialProviderType: ProviderType =
      isOpenAIAlreadySelected === false
        ? 'OpenAI'
        : isAnthropicAlreadySelected === false
          ? 'Anthropic'
          : isOpenAICodexAlreadySelected === false
            ? 'OpenAICodex'
            : 'OpenAICompatible';

    this.addProviderForm = this.fb.group({
      type: this.fb.control<ProviderType>('OpenAI', [Validators.required]),
      name: this.fb.control<string>(OPENAI_PROVIDER_NAME),
      providerId: this.fb.control<string>(OPENAI_PROVIDER_ID),
      baseURL: this.fb.control<string>(undefined),
      apiKey: this.fb.control<string>(undefined, [Validators.required]),
      headers: this.fb.array<FormGroup<ProviderKeyValueControls>>([]),
      queryParams: this.fb.array<FormGroup<ProviderKeyValueControls>>([])
    });

    this.addProviderForm.controls['type'].valueChanges.subscribe(
      (type: ProviderType) => {
        this.applyProviderType({ type: type });
      }
    );

    if (initialProviderType !== 'OpenAI') {
      this.addProviderForm.controls['type'].setValue(initialProviderType);
    }
  }

  get providerType(): ProviderType {
    return this.addProviderForm?.controls['type'].value;
  }

  get isOpenAICompatible(): boolean {
    return this.providerType === 'OpenAICompatible';
  }

  get usesApiKey(): boolean {
    return (
      this.providerType === 'OpenAI' ||
      this.providerType === 'Anthropic' ||
      this.providerType === 'OpenAICompatible'
    );
  }

  getHeaders(): FormArray<FormGroup<ProviderKeyValueControls>> {
    let headers: FormArray<FormGroup<ProviderKeyValueControls>> =
      this.addProviderForm.controls['headers'];

    return headers;
  }

  addHeader() {
    this.getHeaders().push(this.makeKeyValueGroup({}));
  }

  removeHeader(item: { index: number }) {
    let { index } = item;

    this.getHeaders().removeAt(index);
  }

  getQueryParams(): FormArray<FormGroup<ProviderKeyValueControls>> {
    let queryParams: FormArray<FormGroup<ProviderKeyValueControls>> =
      this.addProviderForm.controls['queryParams'];

    return queryParams;
  }

  addQueryParam() {
    this.getQueryParams().push(this.makeKeyValueGroup({}));
  }

  removeQueryParam(item: { index: number }) {
    let { index } = item;

    this.getQueryParams().removeAt(index);
  }

  add() {
    this.addProviderForm.markAllAsTouched();

    if (!this.addProviderForm.valid) {
      return;
    }

    let value: AddProviderFormValue = this.addProviderForm.getRawValue();
    let type: ProviderType = value.type;
    let payload: ToBackendCreateProviderRequest['input'];

    if (type === 'OpenAICompatible') {
      payload = {
        name: value.name.trim(),
        projectId: this.ref.data.projectId,
        providerId: value.providerId.trim(),
        type: type,
        options: {
          baseURL: value.baseURL.trim(),
          apiKey: value.apiKey?.trim() || undefined,
          headers: value.headers.map(
            (header: { key: string; value: string }) => ({
              key: header.key.trim(),
              value: header.value
            })
          ),
          queryParams: value.queryParams.map(
            (queryParam: { key: string; value: string }) => ({
              key: queryParam.key.trim(),
              value: queryParam.value
            })
          )
        }
      };
    } else if (type === 'OpenAICodex') {
      payload = {
        projectId: this.ref.data.projectId,
        providerId: CODEX_PROVIDER_ID,
        type: type,
        options: {}
      };
    } else if (type === 'OpenAI') {
      payload = {
        projectId: this.ref.data.projectId,
        providerId: OPENAI_PROVIDER_ID,
        type: type,
        options: {
          apiKey: value.apiKey.trim()
        }
      };
    } else {
      payload = {
        projectId: this.ref.data.projectId,
        providerId: ANTHROPIC_PROVIDER_ID,
        type: 'Anthropic',
        options: {
          apiKey: value.apiKey.trim()
        }
      };
    }

    this.ref.close();

    this.ref.data.apiService
      .req({
        route: 'api/ToBackendCreateProvider',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendCreateProviderResponse) => {
          if (resp?.type !== 'Success') {
            return;
          }
          let providers = this.providersQuery.getValue().providers;
          let newProviders = [...providers, resp.output.provider].sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          this.providersQuery.updatePart({ providers: newProviders });
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }

  private applyProviderType(item: { type: ProviderType }) {
    let { type } = item;

    let nameControl: FormControl<string> =
      this.addProviderForm.controls['name'];

    let providerIdControl: FormControl<string> =
      this.addProviderForm.controls['providerId'];

    let baseUrlControl: FormControl<string> =
      this.addProviderForm.controls['baseURL'];

    let apiKeyControl: FormControl<string> =
      this.addProviderForm.controls['apiKey'];

    this.getHeaders().clear();

    this.getQueryParams().clear();

    this.addProviderForm.controls['apiKey'].setValue(undefined, {
      emitEvent: false
    });

    baseUrlControl.setValue(undefined);

    if (type === 'OpenAICompatible') {
      nameControl.setValue(undefined);

      nameControl.setValidators([
        Validators.required,
        Validators.maxLength(100)
      ]);

      providerIdControl.setValue(undefined);

      providerIdControl.setValidators([
        Validators.required,
        ValidationService.providerNameWrongChars,
        Validators.maxLength(32)
      ]);

      baseUrlControl.setValidators([
        Validators.required,
        ValidationService.apiUrlValidator,
        ValidationService.openAiCompatibleBaseUrlValidator
      ]);

      apiKeyControl.clearValidators();
    } else {
      nameControl.clearValidators();

      nameControl.setValue(
        type === 'OpenAI'
          ? OPENAI_PROVIDER_NAME
          : type === 'Anthropic'
            ? ANTHROPIC_PROVIDER_NAME
            : CODEX_PROVIDER_NAME
      );

      providerIdControl.clearValidators();

      baseUrlControl.clearValidators();

      providerIdControl.setValue(
        type === 'OpenAI'
          ? OPENAI_PROVIDER_ID
          : type === 'Anthropic'
            ? ANTHROPIC_PROVIDER_ID
            : CODEX_PROVIDER_ID
      );

      if (type === 'OpenAI' || type === 'Anthropic') {
        apiKeyControl.setValidators([Validators.required]);
      } else {
        apiKeyControl.clearValidators();
      }
    }
    nameControl.updateValueAndValidity();
    providerIdControl.updateValueAndValidity();
    baseUrlControl.updateValueAndValidity();
    apiKeyControl.updateValueAndValidity();
  }

  private makeKeyValueGroup(item: {
    key?: string;
    value?: string;
    isValueRequired?: boolean;
  }): FormGroup<ProviderKeyValueControls> {
    let { key, value, isValueRequired = true } = item;

    let group: FormGroup<ProviderKeyValueControls> = this.fb.group({
      key: this.fb.control<string>(key, [Validators.required]),
      value: this.fb.control<string>(
        value,
        isValueRequired === true ? [Validators.required] : []
      )
    });

    return group;
  }
}
