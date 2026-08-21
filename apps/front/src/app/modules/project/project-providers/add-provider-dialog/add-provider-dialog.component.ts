import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
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
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { Provider } from '#common/zod/backend/provider';
import type { ToBackendCreateProviderRequestPayload } from '#common/zod/to-backend/providers/create-provider/create-provider-request-payload';
import type { ToBackendCreateProviderResponse } from '#common/zod/to-backend/providers/create-provider/create-provider-response';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { ProvidersQuery } from '#front/app/queries/providers.query';
import { ApiService } from '#front/app/services/api.service';
import { ValidationService } from '#front/app/services/validation.service';

export interface AddProviderDialogData {
  apiService: ApiService;
  projectId: string;
}

type SelectableProviderType = {
  value: ProviderTypeEnum;
  label: string;
  disabled: boolean;
  isAlreadySelected: boolean;
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

  addProviderForm: FormGroup;

  providerTypeEnum = ProviderTypeEnum;

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
      provider => provider.type === ProviderTypeEnum.Anthropic
    );

    let isOpenAIAlreadySelected: boolean = providers.some(
      provider => provider.type === ProviderTypeEnum.OpenAI
    );

    let isOpenAICodexAlreadySelected: boolean = providers.some(
      provider => provider.type === ProviderTypeEnum.OpenAICodex
    );

    this.providerTypes = [
      {
        value: ProviderTypeEnum.Anthropic,
        label: PROVIDER_TYPE_NAME_BY_TYPE[ProviderTypeEnum.Anthropic],
        disabled: isAnthropicAlreadySelected,
        isAlreadySelected: isAnthropicAlreadySelected
      },
      {
        value: ProviderTypeEnum.OpenAI,
        label: PROVIDER_TYPE_NAME_BY_TYPE[ProviderTypeEnum.OpenAI],
        disabled: isOpenAIAlreadySelected,
        isAlreadySelected: isOpenAIAlreadySelected
      },
      {
        value: ProviderTypeEnum.OpenAICodex,
        label: PROVIDER_TYPE_NAME_BY_TYPE[ProviderTypeEnum.OpenAICodex],
        disabled: isOpenAICodexAlreadySelected,
        isAlreadySelected: isOpenAICodexAlreadySelected
      },
      {
        value: ProviderTypeEnum.OpenAICompatible,
        label: PROVIDER_TYPE_NAME_BY_TYPE[ProviderTypeEnum.OpenAICompatible],
        disabled: false,
        isAlreadySelected: false
      }
    ];

    let initialProviderType: ProviderTypeEnum =
      isOpenAIAlreadySelected === false
        ? ProviderTypeEnum.OpenAI
        : isAnthropicAlreadySelected === false
          ? ProviderTypeEnum.Anthropic
          : isOpenAICodexAlreadySelected === false
            ? ProviderTypeEnum.OpenAICodex
            : ProviderTypeEnum.OpenAICompatible;

    this.addProviderForm = this.fb.group({
      type: [ProviderTypeEnum.OpenAI, [Validators.required]],
      name: [OPENAI_PROVIDER_NAME],
      providerId: [OPENAI_PROVIDER_ID],
      baseURL: [undefined],
      apiKey: [undefined, [Validators.required]],
      headers: this.fb.array([]),
      queryParams: this.fb.array([])
    });

    this.addProviderForm.controls['type'].valueChanges.subscribe(
      (type: ProviderTypeEnum) => {
        this.applyProviderType({ type: type });
      }
    );

    if (initialProviderType !== ProviderTypeEnum.OpenAI) {
      this.addProviderForm.controls['type'].setValue(initialProviderType);
    }
  }

  get providerType(): ProviderTypeEnum {
    return this.addProviderForm?.controls['type'].value;
  }

  get isOpenAICompatible(): boolean {
    return this.providerType === ProviderTypeEnum.OpenAICompatible;
  }

  get usesApiKey(): boolean {
    return (
      this.providerType === ProviderTypeEnum.OpenAI ||
      this.providerType === ProviderTypeEnum.Anthropic ||
      this.providerType === ProviderTypeEnum.OpenAICompatible
    );
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

  add() {
    this.addProviderForm.markAllAsTouched();

    if (!this.addProviderForm.valid) {
      return;
    }

    let value = this.addProviderForm.getRawValue();
    let type: ProviderTypeEnum = value.type;
    let payload: ToBackendCreateProviderRequestPayload;

    if (type === ProviderTypeEnum.OpenAICompatible) {
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
    } else if (type === ProviderTypeEnum.OpenAICodex) {
      payload = {
        projectId: this.ref.data.projectId,
        providerId: CODEX_PROVIDER_ID,
        type: type,
        options: {}
      };
    } else if (type === ProviderTypeEnum.OpenAI) {
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
        type: ProviderTypeEnum.Anthropic,
        options: {
          apiKey: value.apiKey.trim()
        }
      };
    }

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
            (a, b) => a.name.localeCompare(b.name)
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

  private applyProviderType(item: { type: ProviderTypeEnum }) {
    let { type } = item;

    let nameControl = this.addProviderForm.controls['name'];
    let providerIdControl = this.addProviderForm.controls['providerId'];
    let baseUrlControl = this.addProviderForm.controls['baseURL'];
    let apiKeyControl = this.addProviderForm.controls['apiKey'];

    this.getHeaders().clear();

    this.getQueryParams().clear();

    this.addProviderForm.controls['apiKey'].setValue(undefined, {
      emitEvent: false
    });

    baseUrlControl.setValue(undefined);

    if (type === ProviderTypeEnum.OpenAICompatible) {
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
        type === ProviderTypeEnum.OpenAI
          ? OPENAI_PROVIDER_NAME
          : type === ProviderTypeEnum.Anthropic
            ? ANTHROPIC_PROVIDER_NAME
            : CODEX_PROVIDER_NAME
      );

      providerIdControl.clearValidators();

      baseUrlControl.clearValidators();

      providerIdControl.setValue(
        type === ProviderTypeEnum.OpenAI
          ? OPENAI_PROVIDER_ID
          : type === ProviderTypeEnum.Anthropic
            ? ANTHROPIC_PROVIDER_ID
            : CODEX_PROVIDER_ID
      );

      if (
        type === ProviderTypeEnum.OpenAI ||
        type === ProviderTypeEnum.Anthropic
      ) {
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
  }) {
    let { key, value, isValueRequired = true } = item;

    return this.fb.group({
      key: [key, [Validators.required]],
      value: [value, isValueRequired === true ? [Validators.required] : []]
    });
  }
}
