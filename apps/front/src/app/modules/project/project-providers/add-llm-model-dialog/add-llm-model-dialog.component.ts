import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  type FormGroup,
  ReactiveFormsModule,
  type ValidatorFn,
  Validators
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { TippyDirective } from '@ngneat/helipopper';
import { UiSwitchModule } from 'ngx-ui-switch';
import { delay, take, tap } from 'rxjs/operators';
import { LLM_MODEL_DEFAULT_VARIANT } from '#common/constants/llm-models';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import type { Extend } from '#common/types/extend';
import type { LlmModelPart } from '#common/zod/backend/llm-models/llm-model-part';
import type { LlmModelVariant } from '#common/zod/backend/llm-models/llm-model-variant';
import type { Provider } from '#common/zod/backend/provider';
import type { ToBackendCreateLlmModelRequestPayload } from '#common/zod/to-backend/llm-models/create-llm-model/create-llm-model-request-payload';
import type { ToBackendCreateLlmModelResponse } from '#common/zod/to-backend/llm-models/create-llm-model/create-llm-model-response';
import type { ToBackendGetLlmModelPartsRequestPayload } from '#common/zod/to-backend/llm-models/get-llm-model-parts/get-llm-model-parts-request-payload';
import type { ToBackendGetLlmModelPartsResponse } from '#common/zod/to-backend/llm-models/get-llm-model-parts/get-llm-model-parts-response';
import { getLlmModelVariantsError } from '#front/app/functions/get-llm-model-variants-error';
import { LlmModelVariantsComponent } from '#front/app/modules/project/project-providers/llm-model-variants/llm-model-variants.component';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { ProvidersQuery } from '#front/app/queries/providers.query';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { ValidationService } from '#front/app/services/validation.service';

export interface AddLlmModelDialogData {
  apiService: ApiService;
  provider: Provider;
}

type SelectableLlmModelPart = Extend<
  LlmModelPart,
  { disabled: boolean; isAlreadySelected: boolean }
>;

@Component({
  selector: 'm-add-llm-model-dialog',
  templateUrl: './add-llm-model-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    NgSelectModule,
    UiSwitchModule,
    TippyDirective,
    LlmModelVariantsComponent
  ]
})
export class AddLlmModelDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  modelForm: FormGroup;
  providerTypeEnum = ProviderTypeEnum;
  modelParts: SelectableLlmModelPart[] = [];
  selectedModelPart?: SelectableLlmModelPart;
  isManualEntry = false;
  isManualEntryRequired = false;
  modelsLoading = false;
  modelsErrorMessage?: string;
  animatedDestination?: 'isExplorer' | 'isBuilder';
  destinationAnimationTimer?: ReturnType<typeof setTimeout>;
  variants: LlmModelVariant[] = [];
  showVariantsValidation = false;
  variantsErrorMessage?: string;

  constructor(
    public ref: DialogRef<AddLlmModelDialogData>,
    private fb: FormBuilder,
    private providersQuery: ProvidersQuery,
    private userQuery: UserQuery,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    let isOpenAICompatible =
      this.ref.data.provider.type === ProviderTypeEnum.OpenAICompatible;

    let isOpenAICodex =
      this.ref.data.provider.type === ProviderTypeEnum.OpenAICodex;

    let isCodexAuthSet: boolean =
      this.userQuery.getValue().isCodexAuthSet === true;

    this.isManualEntryRequired = isOpenAICodex && isCodexAuthSet === false;

    this.isManualEntry = this.isManualEntryRequired;

    let isManualModel: boolean =
      isOpenAICompatible || this.isManualEntryRequired;

    this.modelForm = this.fb.group({
      modelId: [undefined, [Validators.required]],
      name: [undefined],
      contextLimit: [
        undefined,
        [ValidationService.integerOrEmptyValidator, Validators.min(1)]
      ],
      inputLimit: [
        undefined,
        [ValidationService.integerOrEmptyValidator, Validators.min(1)]
      ],
      outputLimit: [
        undefined,
        [ValidationService.integerOrEmptyValidator, Validators.min(1)]
      ],
      isExplorer: [isManualModel],
      isBuilder: [isManualModel]
    });

    this.variants = this.makeLlmModelVariants({
      names: [],
      isExplorer: isManualModel,
      isBuilder: isManualModel
    });

    this.updateManualLimitValidators({ isManualModel: isManualModel });

    if (isManualModel === false) {
      this.modelForm.controls['isExplorer'].disable();

      this.modelForm.controls['isBuilder'].disable();

      this.loadModelParts();
    }
  }

  modelSelected(item: { modelId: string }) {
    let { modelId } = item;
    let model = this.modelParts.find(x => x.modelId === modelId);
    if (model) {
      this.selectedModelPart = model;
      this.modelForm.controls['name'].setValue(model.catalogName);
      this.modelForm.controls['isExplorer'].setValue(true);
      this.modelForm.controls['isBuilder'].setValue(model.isOpencodeSupported);

      this.variants = this.makeLlmModelVariants({
        names: model.variants ?? [],
        isExplorer: true,
        isBuilder: model.isOpencodeSupported
      });

      this.modelForm.controls['isExplorer'].enable();

      if (model.isOpencodeSupported) {
        this.modelForm.controls['isBuilder'].enable();
      } else {
        this.modelForm.controls['isBuilder'].disable();
      }
    }
  }

  toggleManualEntry() {
    if (this.isManualEntryRequired) {
      return;
    }

    this.isManualEntry = this.isManualEntry === false;

    this.selectedModelPart = undefined;

    this.modelForm.controls['modelId'].reset();

    this.modelForm.controls['name'].reset();

    this.modelForm.controls['contextLimit'].reset();

    this.modelForm.controls['inputLimit'].reset();

    this.modelForm.controls['outputLimit'].reset();

    this.modelForm.controls['isExplorer'].setValue(this.isManualEntry);

    this.modelForm.controls['isBuilder'].setValue(this.isManualEntry);

    this.variants = this.makeLlmModelVariants({
      names: [],
      isExplorer: this.isManualEntry,
      isBuilder: this.isManualEntry
    });

    this.updateManualLimitValidators({ isManualModel: this.isManualEntry });

    if (this.isManualEntry) {
      this.modelForm.controls['isExplorer'].enable();

      this.modelForm.controls['isBuilder'].enable();
    } else {
      this.modelForm.controls['isExplorer'].disable();

      this.modelForm.controls['isBuilder'].disable();
    }
  }

  updateManualLimitValidators(item: { isManualModel: boolean }) {
    let { isManualModel } = item;

    let contextControl = this.modelForm.controls['contextLimit'];

    let validators: ValidatorFn[] = [
      ValidationService.integerOrEmptyValidator,
      Validators.min(1)
    ];

    contextControl.setValidators(
      isManualModel ? [...validators, Validators.required] : validators
    );

    contextControl.updateValueAndValidity();
  }

  private makeLlmModelVariants(item: {
    names: string[];
    isExplorer: boolean;
    isBuilder: boolean;
  }): LlmModelVariant[] {
    let { names, isExplorer, isBuilder } = item;

    let uniqueNames: string[] = names
      .map(name => name.trim())
      .filter(
        (name, index, values) =>
          name.length > 0 &&
          name.toLocaleLowerCase() !== LLM_MODEL_DEFAULT_VARIANT &&
          values.findIndex(
            value => value.toLocaleLowerCase() === name.toLocaleLowerCase()
          ) === index
      );

    let variants: LlmModelVariant[] = [
      LLM_MODEL_DEFAULT_VARIANT,
      ...uniqueNames
    ].map(variant => ({
      variant: variant,
      isExplorer: isExplorer,
      isExplorerRecommended: false,
      isBuilder: isBuilder,
      isBuilderRecommended: false
    }));

    return variants;
  }

  toggleDestination(item: { controlName: 'isExplorer' | 'isBuilder' }) {
    let { controlName } = item;
    let control = this.modelForm.controls[controlName];
    if (control.disabled) {
      return;
    }

    clearTimeout(this.destinationAnimationTimer);

    this.animatedDestination = controlName;

    let enabled: boolean = control.value !== true;

    control.setValue(enabled);

    if (enabled) {
      this.ensureDestinationVariant({ controlName: controlName });
    }

    this.destinationAnimationTimer = setTimeout(() => {
      this.animatedDestination = undefined;
      this.changeDetectorRef.detectChanges();
    }, 300);
  }

  ensureDestinationVariant(item: { controlName: 'isExplorer' | 'isBuilder' }) {
    let { controlName } = item;
    let enabledKey: 'isExplorer' | 'isBuilder' = controlName;

    let hasEnabledVariant: boolean = this.variants.some(
      variant => variant[enabledKey]
    );

    if (hasEnabledVariant) {
      return;
    }

    let selectedVariant: LlmModelVariant = this.variants[0];

    this.variants = this.variants.map(variant => ({
      variant: variant.variant,
      isExplorer:
        controlName === 'isExplorer' && variant === selectedVariant
          ? true
          : variant.isExplorer,
      isExplorerRecommended: variant.isExplorerRecommended,
      isBuilder:
        controlName === 'isBuilder' && variant === selectedVariant
          ? true
          : variant.isBuilder,
      isBuilderRecommended: variant.isBuilderRecommended
    }));
  }

  formatContextLimit(item: { contextLimit?: number }): string {
    let { contextLimit } = item;

    if (isUndefined(contextLimit)) {
      return 'Not available';
    }

    let contextLimitString: string = contextLimit.toString();

    let formattedContextLimit: string = contextLimitString.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      ' '
    );

    return formattedContextLimit;
  }

  loadModelParts() {
    let provider = this.ref.data.provider;
    let payload: ToBackendGetLlmModelPartsRequestPayload = {
      projectId: provider.projectId,
      providerId: provider.providerId
    };

    this.modelsLoading = true;
    this.ref.data.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetLlmModelParts,
        payload: payload
      })
      .pipe(
        delay(0),
        tap((resp: ToBackendGetLlmModelPartsResponse) => {
          let configuredModelIds: string[] = provider.models.map(
            model => model.modelId
          );

          let modelParts: SelectableLlmModelPart[] =
            resp.info?.status === ResponseInfoStatusEnum.Ok
              ? resp.payload.modelParts.map(modelPart => {
                  let isAlreadySelected: boolean = configuredModelIds.includes(
                    modelPart.modelId
                  );

                  return {
                    ...modelPart,
                    disabled: isAlreadySelected,
                    isAlreadySelected: isAlreadySelected
                  };
                })
              : [];

          modelParts.sort((a, b) => {
            let nameComparison: number = a.catalogName.localeCompare(
              b.catalogName,
              undefined,
              { sensitivity: 'base' }
            );

            return nameComparison !== 0
              ? nameComparison
              : a.modelId.localeCompare(b.modelId);
          });

          this.modelParts = modelParts;

          this.modelsErrorMessage =
            resp.info?.status === ResponseInfoStatusEnum.Ok
              ? resp.payload.errorMessage
              : undefined;

          this.modelsLoading = false;

          this.changeDetectorRef.detectChanges();
        }),
        take(1)
      )
      .subscribe();
  }

  save() {
    this.modelForm.markAllAsTouched();
    this.showVariantsValidation = true;

    let value = this.modelForm.getRawValue();

    this.variantsErrorMessage = getLlmModelVariantsError({
      variants: this.variants,
      isExplorer: value.isExplorer === true,
      isBuilder: value.isBuilder === true
    });

    if (!this.modelForm.valid) {
      return;
    }

    let provider = this.ref.data.provider;

    if (this.variantsErrorMessage) {
      return;
    }

    let isManualModel: boolean =
      provider.type === ProviderTypeEnum.OpenAICompatible || this.isManualEntry;

    let isInputLimitInvalid: boolean =
      isManualModel &&
      isDefined(value.inputLimit) &&
      value.inputLimit > value.contextLimit;

    let isOutputLimitInvalid: boolean =
      isManualModel &&
      isDefined(value.outputLimit) &&
      value.outputLimit > value.contextLimit;

    if (isInputLimitInvalid) {
      this.modelForm.controls['inputLimit'].setErrors({
        modelLimitExceedsContext: { contextLimit: value.contextLimit }
      });
    }

    if (isOutputLimitInvalid) {
      this.modelForm.controls['outputLimit'].setErrors({
        modelLimitExceedsContext: { contextLimit: value.contextLimit }
      });
    }

    if (isInputLimitInvalid || isOutputLimitInvalid) {
      return;
    }

    let payload: ToBackendCreateLlmModelRequestPayload = {
      projectId: provider.projectId,
      providerId: provider.providerId,
      modelId: value.modelId.trim(),
      name: value.name?.trim(),
      isManual:
        provider.type === ProviderTypeEnum.OpenAICodex && this.isManualEntry,
      contextLimit: isManualModel ? value.contextLimit : undefined,
      inputLimit: isManualModel ? value.inputLimit || undefined : undefined,
      outputLimit: isManualModel ? value.outputLimit || undefined : undefined,
      isExplorer: value.isExplorer === true,
      isBuilder: value.isBuilder === true,
      variants: this.variants
    };

    this.ref.close();

    this.ref.data.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCreateLlmModel,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendCreateLlmModelResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
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
          }
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
