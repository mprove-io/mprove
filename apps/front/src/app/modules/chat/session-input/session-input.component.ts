import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  type OnChanges,
  Output,
  type SimpleChanges
} from '@angular/core';
import uFuzzy from '@leeoniya/ufuzzy';
import { take, tap } from 'rxjs/operators';
import { LLM_MODEL_DEFAULT_VARIANT } from '#common/constants/llm-models';
import { PROVIDER_NAME_BY_ID } from '#common/constants/providers';
import {
  EXPLORER_CONTEXT_USAGE_WARNING_PERCENTAGE,
  RESTRICTED_USER_ALIAS
} from '#common/constants/top';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { LlmModelVariant } from '#common/zod/backend/llm-models/llm-model-variant';
import type {
  ToBackendGetLlmModelsWithProviderRequestPayload,
  ToBackendGetLlmModelsWithProviderResponse
} from '#common/zod/to-backend/llm-models/get-llm-models-with-provider/get-llm-models-with-provider';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery } from '#front/app/queries/nav.query';
import { ProjectQuery } from '#front/app/queries/project.query';
import { SessionModelsQuery } from '#front/app/queries/session-models.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { UiService } from '#front/app/services/ui.service';

type SessionVariantOption = {
  value: string;
  label: string;
  isRecommended: boolean;
};

@Component({
  standalone: false,
  selector: 'm-session-input',
  templateUrl: './session-input.component.html'
})
export class SessionInputComponent implements OnChanges {
  @Input() modelExtraId: string;
  @Output() modelExtraIdChange = new EventEmitter<string>();

  @Input() agent = 'build';
  @Output() agentChange = new EventEmitter<string>();

  @Input() variant = 'default';
  @Output() variantChange = new EventEmitter<string>();

  sessionTypeEnum = SessionTypeEnum;

  @Input() sessionType: SessionTypeEnum = SessionTypeEnum.Explorer;
  @Input() disabled = false;
  @Input() showSelects = true;
  @Input() scrollableInput = false;
  @Input() sessionId: string;
  @Input() isWorking = false;

  @Output() send = new EventEmitter<string>();
  @Output() stop = new EventEmitter<void>();

  messageText = '';

  models: {
    value: string;
    label: string;
    modelId: string;
    modelName: string;
    providerId: string;
    providerName: string;
    contextLimit?: number;
    contextLimitFormatted: string;
  }[] = [];
  modelsLoading = false;
  providerNameById: Record<string, string> = {};
  agents = ['build', 'plan'];
  variants: SessionVariantOption[] = [
    {
      value: LLM_MODEL_DEFAULT_VARIANT,
      label: LLM_MODEL_DEFAULT_VARIANT,
      isRecommended: false
    }
  ];
  modelVariantsMap = new Map<string, LlmModelVariant[]>();
  projectHasE2bApiKey = true;
  effectiveDisabled = false;
  isEditor = true;
  isExplorer = false;
  isRestrictedUser = false;

  showUsageWarning = false;
  isUsageLimitReached = false;
  contextUsageWarningPercentage = EXPLORER_CONTEXT_USAGE_WARNING_PERCENTAGE;

  constructor(
    private cd: ChangeDetectorRef,
    private memberQuery: MemberQuery,
    private projectQuery: ProjectQuery,
    private navQuery: NavQuery,
    private apiService: ApiService,
    private uiQuery: UiQuery,
    private userQuery: UserQuery,
    private uiService: UiService,
    private sessionModelsQuery: SessionModelsQuery
  ) {
    let member = this.memberQuery.getValue();
    this.isEditor = member.isEditor;
    this.isExplorer = member.isExplorer;

    let user = this.userQuery.getValue();
    this.isRestrictedUser = user.alias === RESTRICTED_USER_ALIAS;

    let state = this.sessionModelsQuery.getValue();

    let models =
      this.sessionType === SessionTypeEnum.Explorer
        ? state.modelsAi
        : state.modelsOpencode;

    this.applyModels({ apiModels: models, selectRecommended: false });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sessionType']) {
      let state = this.sessionModelsQuery.getValue();

      let models =
        this.sessionType === SessionTypeEnum.Explorer
          ? state.modelsAi
          : state.modelsOpencode;

      this.applyModels({ apiModels: models, selectRecommended: false });
      this.updateProjectHasE2bApiKey();
    }
    if (changes['modelExtraId']) {
      this.updateVariants({
        selectRecommended: changes['modelExtraId'].firstChange === false
      });
      this.updateProjectHasE2bApiKey();
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }

  onStop() {
    this.stop.emit();
  }

  onSend() {
    if (
      !this.messageText.trim() ||
      this.effectiveDisabled ||
      !this.modelExtraId
    ) {
      return;
    }
    let text = this.messageText.trim();
    this.messageText = '';
    this.send.emit(text);
  }

  onAgentSelect() {
    this.agentChange.emit(this.agent);
  }

  onModelSelect() {
    this.updateVariants({ selectRecommended: true });

    this.modelExtraIdChange.emit(this.modelExtraId);
    this.variantChange.emit(this.variant);

    let isExplorer = this.sessionType === SessionTypeEnum.Explorer;

    if (isExplorer) {
      this.uiQuery.updatePart({
        newSessionExplorerModelExtraId: this.modelExtraId,
        newSessionExplorerVariant: this.variant
      });
      this.uiService.setUserUi({
        newSessionExplorerModelExtraId: this.modelExtraId,
        newSessionExplorerVariant: this.variant
      });
    } else {
      this.uiQuery.updatePart({
        newSessionEditorModelExtraId: this.modelExtraId,
        newSessionEditorVariant: this.variant
      });
      this.uiService.setUserUi({
        newSessionEditorModelExtraId: this.modelExtraId,
        newSessionEditorVariant: this.variant
      });
    }
  }

  onVariantSelect() {
    this.variantChange.emit(this.variant);

    let isExplorer = this.sessionType === SessionTypeEnum.Explorer;

    if (isExplorer) {
      this.uiQuery.updatePart({
        newSessionExplorerVariant: this.variant
      });

      this.uiService.setUserUi({
        newSessionExplorerModelExtraId: this.modelExtraId,
        newSessionExplorerVariant: this.variant
      });
    } else {
      this.uiService.setUserUi({
        newSessionEditorModelExtraId: this.modelExtraId,
        newSessionEditorVariant: this.variant
      });
    }
  }

  updateEffectiveDisabled() {
    let isEditorSessionWithoutEditorRole =
      this.sessionType === SessionTypeEnum.Editor && !this.isEditor;

    let isExplorerSessionWithoutExplorerRole =
      this.sessionType === SessionTypeEnum.Explorer && !this.isExplorer;

    let isEditorWithoutE2b =
      this.sessionType !== SessionTypeEnum.Explorer &&
      !this.projectHasE2bApiKey;

    this.effectiveDisabled =
      this.disabled ||
      this.isRestrictedUser ||
      isEditorSessionWithoutEditorRole ||
      isExplorerSessionWithoutExplorerRole ||
      isEditorWithoutE2b ||
      (this.sessionType === SessionTypeEnum.Explorer &&
        this.isUsageLimitReached);
  }

  onUsageLimitReachedChange(item: { isReached: boolean }) {
    let { isReached } = item;

    this.isUsageLimitReached = isReached;

    this.updateEffectiveDisabled();
  }

  updateProjectHasE2bApiKey() {
    let project = this.projectQuery.getValue();

    this.projectHasE2bApiKey = !!project.isE2bApiKeySet;

    this.updateEffectiveDisabled();
  }

  updateVariants(item: { selectRecommended: boolean }) {
    let { selectRecommended } = item;
    let modelVariants: LlmModelVariant[] =
      this.modelVariantsMap.get(this.modelExtraId) ?? [];

    let enabledVariants: LlmModelVariant[] = modelVariants.filter(variant =>
      this.sessionType === SessionTypeEnum.Explorer
        ? variant.isExplorer
        : variant.isBuilder
    );

    this.variants = enabledVariants.map(variant => {
      let isRecommended: boolean =
        this.sessionType === SessionTypeEnum.Explorer
          ? variant.isExplorerRecommended
          : variant.isBuilderRecommended;

      return {
        value: variant.variant,
        label: variant.variant,
        isRecommended: isRecommended
      };
    });

    let isCurrentVariantAvailable: boolean = this.variants.some(
      variant => variant.value === this.variant
    );

    if (selectRecommended || isCurrentVariantAvailable === false) {
      let selectedVariant: SessionVariantOption =
        this.variants.find(variant => variant.isRecommended) ??
        this.variants.find(
          variant => variant.value === LLM_MODEL_DEFAULT_VARIANT
        ) ??
        this.variants[0];

      this.variant = selectedVariant?.value ?? LLM_MODEL_DEFAULT_VARIANT;
    }
  }

  applyModels(item: {
    apiModels: {
      modelId: string;
      name?: string;
      providerId: string;
      providerName: string;
      variants: LlmModelVariant[];
      contextLimit?: number;
      inputLimit?: number;
    }[];
    selectRecommended: boolean;
  }) {
    let { apiModels, selectRecommended } = item;

    this.modelVariantsMap.clear();
    this.providerNameById = {};

    let modelOptions = apiModels.map(m => {
      let value = `${m.providerId}/${m.modelId}`;
      let modelName: string = m.name ?? m.modelId;

      this.providerNameById[m.providerId] = m.providerName;

      if (m.variants.length > 0) {
        this.modelVariantsMap.set(value, m.variants);
      }

      return {
        value: value,
        label: modelName,
        modelId: m.modelId,
        modelName: modelName,
        providerId: m.providerId,
        providerName: m.providerName,
        contextLimit: m.contextLimit ?? m.inputLimit,
        contextLimitFormatted: this.formatContextLimit({
          contextLimit: m.contextLimit ?? m.inputLimit
        })
      };
    });
    modelOptions.sort((a, b) => {
      let aIsOpenAICompatible: boolean =
        PROVIDER_NAME_BY_ID[a.providerId] === undefined;

      let bIsOpenAICompatible: boolean =
        PROVIDER_NAME_BY_ID[b.providerId] === undefined;

      if (aIsOpenAICompatible !== bIsOpenAICompatible) {
        return aIsOpenAICompatible ? 1 : -1;
      }

      let providerNameComparison: number = a.providerName.localeCompare(
        b.providerName
      );

      if (providerNameComparison !== 0) {
        return providerNameComparison;
      }

      return a.modelId.localeCompare(b.modelId);
    });
    this.models = modelOptions;
    this.updateVariants({ selectRecommended: selectRecommended });
  }

  formatContextLimit(item: { contextLimit?: number }) {
    let { contextLimit } = item;

    if (!contextLimit) {
      return '';
    }

    if (contextLimit >= 1000000) {
      return `${Math.round(contextLimit / 1000000)}M`;
    }

    if (contextLimit >= 1000) {
      return `${Math.round(contextLimit / 1000)}K`;
    }

    return contextLimit.toString();
  }

  openModelSelect() {
    this.modelsLoading = true;

    let nav = this.navQuery.getValue();

    let payload: ToBackendGetLlmModelsWithProviderRequestPayload = {
      projectId: nav.projectId,
      sessionTypes: [this.sessionType]
    };

    this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendGetLlmModelsWithProvider,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetLlmModelsWithProviderResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let state = this.sessionModelsQuery.getValue();

            let updatedModelsOpencode =
              this.sessionType === SessionTypeEnum.Editor
                ? resp.payload.modelsOpencode
                : state.modelsOpencode;

            let updatedModelsAi =
              this.sessionType === SessionTypeEnum.Explorer
                ? resp.payload.modelsAi
                : state.modelsAi;

            this.sessionModelsQuery.update({
              modelsOpencode: updatedModelsOpencode,
              modelsAi: updatedModelsAi
            });

            let models =
              this.sessionType === SessionTypeEnum.Explorer
                ? resp.payload.modelsAi
                : resp.payload.modelsOpencode;

            this.applyModels({ apiModels: models, selectRecommended: false });
          }
          this.modelsLoading = false;
          this.cd.detectChanges();
        }),
        take(1)
      )
      .subscribe();
  }

  agentsSearchFn(term: string, agent: string) {
    let haystack = [`${agent}`];
    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);
    return idxs != null && idxs.length > 0;
  }

  modelsSearchFn(
    term: string,
    model: {
      label: string;
      modelId: string;
      modelName: string;
      providerName: string;
    }
  ) {
    let haystack = [
      `${model.providerName} ${model.modelName} ${model.modelId}`
    ];
    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);
    return idxs != null && idxs.length > 0;
  }

  variantsSearchFn(term: string, variant: SessionVariantOption) {
    let haystack = [`${variant.value}`];
    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);
    return idxs != null && idxs.length > 0;
  }
}
