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
  Validators
} from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { TippyDirective } from '@ngneat/helipopper';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { UiSwitchModule } from 'ngx-ui-switch';
import { finalize, take, tap } from 'rxjs/operators';
import { LLM_MODEL_DEFAULT_VARIANT } from '#common/constants/llm-models';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import type { LlmModel } from '#common/zod/backend/llm-models/llm-model';
import type { LlmModelPart } from '#common/zod/backend/llm-models/llm-model-part';
import type { LlmModelVariant } from '#common/zod/backend/llm-models/llm-model-variant';
import type { Provider } from '#common/zod/backend/provider';
import type { ToBackendEditLlmModelRequestPayload } from '#common/zod/to-backend/llm-models/edit-llm-model/edit-llm-model-request-payload';
import type { ToBackendEditLlmModelResponse } from '#common/zod/to-backend/llm-models/edit-llm-model/edit-llm-model-response';
import type { ToBackendGetLlmModelPartsRequestPayload } from '#common/zod/to-backend/llm-models/get-llm-model-parts/get-llm-model-parts-request-payload';
import type { ToBackendGetLlmModelPartsResponse } from '#common/zod/to-backend/llm-models/get-llm-model-parts/get-llm-model-parts-response';
import { getLlmModelVariantsError } from '#front/app/functions/get-llm-model-variants-error';
import { LlmModelVariantsComponent } from '#front/app/modules/project/project-providers/llm-model-variants/llm-model-variants.component';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { ProvidersQuery } from '#front/app/queries/providers.query';
import { ApiService } from '#front/app/services/api.service';
import { ValidationService } from '#front/app/services/validation.service';

export interface EditLlmModelDialogData {
  apiService: ApiService;
  provider: Provider;
  model: LlmModel;
}

@Component({
  selector: 'm-edit-llm-model-dialog',
  templateUrl: './edit-llm-model-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    SharedModule,
    UiSwitchModule,
    TippyDirective,
    LlmModelVariantsComponent
  ]
})
export class EditLlmModelDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  modelForm: FormGroup;
  model: LlmModel;
  providerTypeEnum = ProviderTypeEnum;
  animatedDestination?: 'isExplorer' | 'isBuilder';
  destinationAnimationTimer?: ReturnType<typeof setTimeout>;
  variants: LlmModelVariant[] = [];
  isRefreshing = false;
  refreshSpinnerName = 'editLlmModelRefreshSpinner';
  variantsDiscoveryErrorMessage?: string;
  showVariantsValidation = false;
  variantsErrorMessage?: string;

  constructor(
    public ref: DialogRef<EditLlmModelDialogData>,
    private fb: FormBuilder,
    private providersQuery: ProvidersQuery,
    private changeDetectorRef: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    let isManualModel: boolean =
      this.ref.data.provider.type === ProviderTypeEnum.OpenAICompatible ||
      this.ref.data.model.isManual === true;

    this.model = {
      ...this.ref.data.model,
      variants: this.ref.data.model.variants.map(variant => ({
        variant: variant.variant,
        isExplorer: variant.isExplorer,
        isExplorerRecommended: variant.isExplorerRecommended,
        isBuilder: variant.isBuilder,
        isBuilderRecommended: variant.isBuilderRecommended
      }))
    };

    this.modelForm = this.fb.group({
      name: [this.ref.data.model.name],
      contextLimit: [
        this.ref.data.model.contextLimit,
        isManualModel
          ? [
              ValidationService.integerOrEmptyValidator,
              Validators.min(1),
              Validators.required
            ]
          : []
      ],
      inputLimit: [
        this.ref.data.model.inputLimit,
        [ValidationService.integerOrEmptyValidator, Validators.min(1)]
      ],
      outputLimit: [
        this.ref.data.model.outputLimit,
        [ValidationService.integerOrEmptyValidator, Validators.min(1)]
      ],
      isExplorer: [this.ref.data.model.isExplorer],
      isBuilder: [this.ref.data.model.isBuilder]
    });

    this.variants = this.ref.data.model.variants.map(variant => ({
      variant: variant.variant,
      isExplorer: variant.isExplorer,
      isExplorerRecommended: variant.isExplorerRecommended,
      isBuilder: variant.isBuilder,
      isBuilderRecommended: variant.isBuilderRecommended
    }));

    if (this.ref.data.model.isOpencodeSupported === false) {
      this.modelForm.controls['isBuilder'].setValue(false);

      this.modelForm.controls['isBuilder'].disable();
    }
  }

  refreshModel() {
    let provider: Provider = this.ref.data.provider;

    let payload: ToBackendGetLlmModelPartsRequestPayload = {
      projectId: provider.projectId,
      providerId: provider.providerId
    };

    this.isRefreshing = true;

    this.variantsDiscoveryErrorMessage = undefined;

    this.changeDetectorRef.detectChanges();

    this.spinner.show(this.refreshSpinnerName);

    this.ref.data.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetLlmModelParts,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetLlmModelPartsResponse) => {
          if (resp.info?.status !== ResponseInfoStatusEnum.Ok) {
            return;
          }

          let modelPart: LlmModelPart | undefined =
            resp.payload.modelParts.find(
              item => item.modelId === this.model.modelId
            );

          if (!isDefined(modelPart)) {
            this.variantsDiscoveryErrorMessage =
              resp.payload.errorMessage ??
              'Could not refresh the model from the provider.';

            return;
          }

          this.applyCurrentVariants({ modelPart: modelPart });

          this.model = {
            ...this.model,
            ...modelPart,
            name: this.model.name,
            isManual: false,
            variants: this.variants,
            isExplorer: this.modelForm.controls['isExplorer'].value === true,
            isBuilder: this.modelForm.controls['isBuilder'].value === true,
            refreshedTs: Date.now()
          };

          if (modelPart.isOpencodeSupported === false) {
            this.modelForm.controls['isBuilder'].setValue(false);

            this.modelForm.controls['isBuilder'].disable();

            this.model.isBuilder = false;

            this.variants = this.variants.map(variant => ({
              variant: variant.variant,
              isExplorer: variant.isExplorer,
              isExplorerRecommended: variant.isExplorerRecommended,
              isBuilder: false,
              isBuilderRecommended: false
            }));

            this.model.variants = this.variants;
          } else {
            this.modelForm.controls['isBuilder'].enable();
          }

          let providers: Provider[] = this.providersQuery
            .getValue()
            .providers.map(itemProvider =>
              itemProvider.providerId === provider.providerId
                ? {
                    ...itemProvider,
                    models: itemProvider.models.map(itemModel =>
                      itemModel.modelId === this.model.modelId
                        ? this.model
                        : itemModel
                    )
                  }
                : itemProvider
            );

          this.providersQuery.updatePart({ providers: providers });
        }),
        finalize(() => {
          this.isRefreshing = false;

          this.spinner.hide(this.refreshSpinnerName);

          this.changeDetectorRef.detectChanges();
        }),
        take(1)
      )
      .subscribe();
  }

  applyCurrentVariants(item: { modelPart: LlmModelPart }) {
    let { modelPart } = item;

    let currentVariantNames: string[] = [
      LLM_MODEL_DEFAULT_VARIANT,
      ...(modelPart.variants ?? [])
    ].filter(
      (variantName, index, names) => names.indexOf(variantName) === index
    );

    let storedVariantsByName: Map<string, LlmModelVariant> = new Map(
      this.variants.map(variant => [variant.variant, variant])
    );

    let currentVariants: LlmModelVariant[] = currentVariantNames.map(
      variantName => {
        let storedVariant: LlmModelVariant | undefined =
          storedVariantsByName.get(variantName);

        return (
          storedVariant ?? {
            variant: variantName,
            isExplorer: false,
            isExplorerRecommended: false,
            isBuilder: false,
            isBuilderRecommended: false
          }
        );
      }
    );

    let hasEnabledExplorerVariant: boolean = currentVariants.some(
      variant => variant.isExplorer
    );

    let hasEnabledBuilderVariant: boolean = currentVariants.some(
      variant => variant.isBuilder
    );

    let isExplorer: boolean =
      this.modelForm.controls['isExplorer'].value === true;

    let isBuilder: boolean =
      this.modelForm.controls['isBuilder'].value === true;

    this.variants = currentVariants.map(variant => ({
      variant: variant.variant,
      isExplorer:
        variant.variant === LLM_MODEL_DEFAULT_VARIANT &&
        isExplorer &&
        hasEnabledExplorerVariant === false
          ? true
          : variant.isExplorer,
      isExplorerRecommended: variant.isExplorerRecommended,
      isBuilder:
        variant.variant === LLM_MODEL_DEFAULT_VARIANT &&
        isBuilder &&
        hasEnabledBuilderVariant === false
          ? true
          : variant.isBuilder,
      isBuilderRecommended: variant.isBuilderRecommended
    }));
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

  save() {
    this.modelForm.markAllAsTouched();
    this.showVariantsValidation = true;

    if (isDefined(this.variantsDiscoveryErrorMessage)) {
      return;
    }

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
      provider.type === ProviderTypeEnum.OpenAICompatible ||
      this.ref.data.model.isManual === true;

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

    let payload: ToBackendEditLlmModelRequestPayload = {
      projectId: provider.projectId,
      providerId: provider.providerId,
      modelId: this.ref.data.model.modelId,
      name:
        provider.type === ProviderTypeEnum.OpenAICompatible ||
        this.ref.data.model.isManual === true
          ? value.name?.trim()
          : this.ref.data.model.name?.trim(),
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
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendEditLlmModel,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendEditLlmModelResponse) => {
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
