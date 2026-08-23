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
import { UiSwitchModule } from 'ngx-ui-switch';
import { take, tap } from 'rxjs/operators';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import type { LlmModel } from '#common/zod/backend/llm-models/llm-model';
import type { Provider } from '#common/zod/backend/provider';
import type { ToBackendEditLlmModelRequestPayload } from '#common/zod/to-backend/llm-models/edit-llm-model/edit-llm-model-request-payload';
import type { ToBackendEditLlmModelResponse } from '#common/zod/to-backend/llm-models/edit-llm-model/edit-llm-model-response';
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
    SharedModule,
    UiSwitchModule,
    TippyDirective
  ]
})
export class EditLlmModelDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  modelForm: FormGroup;
  providerTypeEnum = ProviderTypeEnum;
  animatedDestination?: 'isExplorer' | 'isBuilder';
  destinationAnimationTimer?: ReturnType<typeof setTimeout>;

  constructor(
    public ref: DialogRef<EditLlmModelDialogData>,
    private fb: FormBuilder,
    private providersQuery: ProvidersQuery,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    let isManualModel: boolean =
      this.ref.data.provider.type === ProviderTypeEnum.OpenAICompatible ||
      this.ref.data.model.isManual === true;

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

    if (this.ref.data.model.isOpencodeSupported === false) {
      this.modelForm.controls['isBuilder'].setValue(false);

      this.modelForm.controls['isBuilder'].disable();
    }
  }

  toggleDestination(item: { controlName: 'isExplorer' | 'isBuilder' }) {
    let { controlName } = item;
    let control = this.modelForm.controls[controlName];
    if (control.disabled) {
      return;
    }

    clearTimeout(this.destinationAnimationTimer);

    this.animatedDestination = controlName;

    control.setValue(control.value !== true);

    this.destinationAnimationTimer = setTimeout(() => {
      this.animatedDestination = undefined;
      this.changeDetectorRef.detectChanges();
    }, 300);
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

    if (!this.modelForm.valid) {
      return;
    }

    let provider = this.ref.data.provider;
    let value = this.modelForm.getRawValue();

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
      isBuilder: value.isBuilder === true
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
