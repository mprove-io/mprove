import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import uFuzzy from '@leeoniya/ufuzzy';
import { take, tap } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type {
  ToBackendGetSessionProviderModelsRequestPayload,
  ToBackendGetSessionProviderModelsResponse
} from '#common/zod/to-backend/sessions/to-backend-get-session-provider-models';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery } from '#front/app/queries/nav.query';
import { ProjectQuery } from '#front/app/queries/project.query';
import { SessionModelsQuery } from '#front/app/queries/session-models.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { UiService } from '#front/app/services/ui.service';

@Component({
  standalone: false,
  selector: 'm-session-input',
  templateUrl: './session-input.component.html'
})
export class SessionInputComponent implements OnChanges {
  @Input() model: string;
  @Output() modelChange = new EventEmitter<string>();

  @Input() agent = 'build';
  @Output() agentChange = new EventEmitter<string>();

  @Input() variant = 'default';
  @Output() variantChange = new EventEmitter<string>();

  @Input() useCodex = false;
  @Output() useCodexChange = new EventEmitter<boolean>();

  sessionTypeEnum = SessionTypeEnum;

  @Input() sessionType: SessionTypeEnum = SessionTypeEnum.Explorer;
  @Input() disabled = false;
  @Input() showSelects = true;
  @Input() scrollableInput = false;
  @Input() sessionId: string;
  @Input() isWorking = false;

  isCodexAuthSet = false;

  @Output() send = new EventEmitter<string>();
  @Output() stop = new EventEmitter<void>();

  messageText = '';

  models: {
    value: string;
    label: string;
    modelId: string;
    providerId: string;
    providerName: string;
  }[] = [];
  modelsLoading = false;
  agents = ['build', 'plan'];
  variants: string[] = ['default'];
  modelVariantsMap = new Map<string, string[]>();
  projectHasE2bApiKey = true;
  effectiveDisabled = false;
  isEditor = true;

  projectHasAnyApiKeyOrSubscription = true;

  providerHasApiKeyOrSubscription = true;

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
    this.isEditor = this.memberQuery.getValue().isEditor;

    let user = this.userQuery.getValue();
    this.isCodexAuthSet = user.isCodexAuthSet === true;

    let state = this.sessionModelsQuery.getValue();

    let models =
      this.sessionType === SessionTypeEnum.Explorer
        ? state.modelsAi
        : state.modelsOpencode;

    this.applyModels(models);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sessionType']) {
      let state = this.sessionModelsQuery.getValue();

      let models =
        this.sessionType === SessionTypeEnum.Explorer
          ? state.modelsAi
          : state.modelsOpencode;

      this.applyModels(models);
      this.updateProjectHasE2bApiKey();
    }
    if (changes['model']) {
      this.updateVariants();
      this.updateProjectHasE2bApiKey();
      this.updateProjectHasAnyApiKeyOrSubscription();
      this.updateProviderHasApiKeyOrSubscription();
    }
    if (changes['disabled'] || changes['useCodex']) {
      this.updateProjectHasAnyApiKeyOrSubscription();
      this.updateProviderHasApiKeyOrSubscription();
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

  toggleUseCodex() {
    this.useCodex = !this.useCodex;
    this.useCodexChange.emit(this.useCodex);
    this.uiQuery.updatePart({ newSessionUseCodex: this.useCodex });
    this.uiService.setUserUi({ newSessionUseCodex: this.useCodex });
    this.updateProjectHasAnyApiKeyOrSubscription();
    this.updateProviderHasApiKeyOrSubscription();
  }

  onSend() {
    if (!this.messageText.trim() || this.effectiveDisabled || !this.model) {
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
    this.updateVariants();

    this.updateProviderHasApiKeyOrSubscription();

    this.modelChange.emit(this.model);
    this.variantChange.emit(this.variant);

    let isExplorer = this.sessionType === SessionTypeEnum.Explorer;

    if (isExplorer) {
      this.uiQuery.updatePart({
        newSessionExplorerProviderModel: this.model
      });
      this.uiService.setUserUi({
        newSessionExplorerProviderModel: this.model
      });
    } else {
      this.uiQuery.updatePart({
        newSessionEditorProviderModel: this.model,
        newSessionEditorVariant: this.variant
      });
      this.uiService.setUserUi({
        newSessionEditorProviderModel: this.model,
        newSessionEditorVariant: this.variant
      });
    }
  }

  onVariantSelect() {
    this.variantChange.emit(this.variant);

    let isExplorer = this.sessionType === SessionTypeEnum.Explorer;

    if (isExplorer) {
      this.uiService.setUserUi({
        newSessionExplorerProviderModel: this.model
      });
    } else {
      this.uiService.setUserUi({
        newSessionEditorProviderModel: this.model,
        newSessionEditorVariant: this.variant
      });
    }
  }

  updateEffectiveDisabled() {
    let isEditorSessionWithoutEditorRole =
      this.sessionType === SessionTypeEnum.Editor && !this.isEditor;

    let isEditorWithoutE2b =
      this.sessionType !== SessionTypeEnum.Explorer &&
      !this.projectHasE2bApiKey;

    this.effectiveDisabled =
      this.disabled ||
      isEditorSessionWithoutEditorRole ||
      !this.projectHasAnyApiKeyOrSubscription ||
      !this.providerHasApiKeyOrSubscription ||
      isEditorWithoutE2b;
  }

  updateProjectHasE2bApiKey() {
    let project = this.projectQuery.getValue();

    this.projectHasE2bApiKey = !!project.isE2bApiKeySet;

    this.updateEffectiveDisabled();
  }

  updateProjectHasAnyApiKeyOrSubscription() {
    let project = this.projectQuery.getValue();

    let hasCodexSubscriptionAndEnabled = this.useCodex && this.isCodexAuthSet;

    this.projectHasAnyApiKeyOrSubscription =
      !!project.isZenApiKeySet ||
      !!project.isOpenaiApiKeySet ||
      !!project.isAnthropicApiKeySet ||
      hasCodexSubscriptionAndEnabled;

    this.updateEffectiveDisabled();
  }

  updateProviderHasApiKeyOrSubscription() {
    if (!this.model) {
      this.providerHasApiKeyOrSubscription = true;
      this.updateEffectiveDisabled();
      return;
    }

    let project = this.projectQuery.getValue();

    let provider = this.model.split('/')[0];

    let hasCodexSubscriptionAndEnabled = this.useCodex && this.isCodexAuthSet;

    if (provider === 'opencode') {
      this.providerHasApiKeyOrSubscription = !!project.isZenApiKeySet;
    } else if (provider === 'openai') {
      this.providerHasApiKeyOrSubscription =
        !!project.isOpenaiApiKeySet || hasCodexSubscriptionAndEnabled;
    } else if (provider === 'anthropic') {
      this.providerHasApiKeyOrSubscription = !!project.isAnthropicApiKeySet;
    } else {
      this.providerHasApiKeyOrSubscription = false;
    }
    this.updateEffectiveDisabled();
  }

  updateVariants() {
    let modelVariants = this.modelVariantsMap.get(this.model);
    if (modelVariants && modelVariants.length > 0) {
      this.variants = ['default', ...modelVariants];
    } else {
      this.variants = ['default'];
    }
    if (!this.variants.includes(this.variant)) {
      this.variant = 'default';
    }
  }

  applyModels(
    apiModels: {
      id: string;
      providerId: string;
      providerName: string;
      variants?: string[];
    }[]
  ) {
    this.modelVariantsMap.clear();
    let modelOptions = apiModels.map(m => {
      let value = `${m.providerId}/${m.id}`;
      if (m.variants && m.variants.length > 0) {
        this.modelVariantsMap.set(value, m.variants);
      }
      return {
        value: value,
        label: `${m.id}`,
        modelId: m.id,
        providerId: m.providerId,
        providerName: m.providerName
      };
    });
    let providerOrder: Record<string, number> = {
      anthropic: 0,
      openai: 1,
      opencode: 2
    };
    modelOptions.sort((a, b) => {
      let aOrder = providerOrder[a.providerId] ?? 1;
      let bOrder = providerOrder[b.providerId] ?? 1;
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      return a.modelId.localeCompare(b.modelId);
    });
    this.models = modelOptions;
    this.updateVariants();
  }

  openModelSelect() {
    this.modelsLoading = true;

    let nav = this.navQuery.getValue();

    let payload: ToBackendGetSessionProviderModelsRequestPayload = {
      projectId: nav.projectId,
      sessionTypes: [this.sessionType]
    };

    this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendGetSessionProviderModels,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetSessionProviderModelsResponse) => {
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

            this.applyModels(models);
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
    model: { label: string; modelId: string; providerName: string }
  ) {
    let haystack = [`${model.providerName} ${model.modelId}`];
    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);
    return idxs != null && idxs.length > 0;
  }

  variantsSearchFn(term: string, variant: string) {
    let haystack = [`${variant}`];
    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);
    return idxs != null && idxs.length > 0;
  }
}
