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
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToBackendGetAgentProviderModelsResponse } from '#common/interfaces/to-backend/agent/to-backend-get-agent-provider-models';
import { AgentModelsQuery } from '#front/app/queries/agent-models.query';
import { ProjectQuery } from '#front/app/queries/project.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { UiService } from '#front/app/services/ui.service';

@Component({
  standalone: false,
  selector: 'm-session-input',
  templateUrl: './session-input.component.html'
})
export class SessionInputComponent implements OnChanges {
  @Input() model = 'default';
  @Output() modelChange = new EventEmitter<string>();

  @Input() agent = 'plan';
  @Output() agentChange = new EventEmitter<string>();

  @Input() variant = 'default';
  @Output() variantChange = new EventEmitter<string>();

  @Input() disabled = false;
  @Input() showSelects = true;
  @Input() scrollableInput = false;
  @Input() sessionId: string | undefined;
  @Input() showAutoScroll = false;
  @Input() autoScroll = false;
  @Input() isWaitingForResponse = false;

  @Output() send = new EventEmitter<string>();
  @Output() stop = new EventEmitter<void>();
  @Output() providerHasApiKeyChange = new EventEmitter<boolean>();
  @Output() autoScrollChange = new EventEmitter<boolean>();

  messageText = '';

  models: {
    value: string;
    label: string;
    modelId: string;
    providerName: string;
  }[] = [
    { value: 'default', label: 'default', modelId: 'default', providerName: '' }
  ];
  modelsLoading = false;
  agents = ['build', 'plan'];
  variants: string[] = ['default'];
  modelVariantsMap = new Map<string, string[]>();
  providerHasApiKey = true;
  effectiveDisabled = false;

  constructor(
    private cd: ChangeDetectorRef,
    private projectQuery: ProjectQuery,
    private apiService: ApiService,
    private uiQuery: UiQuery,
    private uiService: UiService,
    private agentModelsQuery: AgentModelsQuery
  ) {
    this.applyModels(this.agentModelsQuery.getValue().models);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['model']) {
      this.updateVariants();
      this.updateProviderHasApiKey();
    }
    if (changes['disabled']) {
      this.effectiveDisabled = this.disabled || !this.providerHasApiKey;
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
    if (!this.messageText.trim() || this.effectiveDisabled) {
      return;
    }
    let text = this.messageText.trim();
    this.messageText = '';
    this.send.emit(text);
  }

  onModelSelect() {
    this.updateVariants();
    this.updateProviderHasApiKey();
    this.modelChange.emit(this.model);
    this.variantChange.emit(this.variant);
    this.persistSelections();
  }

  onAutoScrollToggle() {
    this.autoScroll = !this.autoScroll;
    this.autoScrollChange.emit(this.autoScroll);
  }

  onAgentSelect() {
    this.agentChange.emit(this.agent);
  }

  onVariantSelect() {
    this.variantChange.emit(this.variant);
    this.persistSelections();
  }

  persistSelections() {
    this.uiQuery.updatePart({
      lastSelectedProviderModel: this.model,
      lastSelectedVariant: this.variant
    });
    this.uiService.setUserUi({
      lastSelectedProviderModel: this.model,
      lastSelectedVariant: this.variant
    });
  }

  getProviderFromModel(): string {
    if (this.model === 'default') {
      return 'opencode';
    }
    return this.model.split('/')[0];
  }

  updateProviderHasApiKey() {
    let provider = this.getProviderFromModel();
    let project = this.projectQuery.getValue();
    if (provider === 'opencode') {
      this.providerHasApiKey = !!project.isZenApiKeySet;
    } else if (provider === 'openai') {
      this.providerHasApiKey = !!project.isOpenaiApiKeySet;
    } else if (provider === 'anthropic') {
      this.providerHasApiKey = !!project.isAnthropicApiKeySet;
    } else {
      this.providerHasApiKey = false;
    }
    this.effectiveDisabled = this.disabled || !this.providerHasApiKey;
    this.providerHasApiKeyChange.emit(this.providerHasApiKey);
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
        value,
        label: `${m.id}`,
        modelId: m.id,
        providerName: m.providerName
      };
    });
    this.models = [
      {
        value: 'default',
        label: 'default',
        modelId: 'default',
        providerName: ''
      },
      ...modelOptions
    ];
    this.updateVariants();
  }

  openModelSelect() {
    this.modelsLoading = true;

    let payload: { sessionId?: string } = {};
    if (this.sessionId) {
      payload.sessionId = this.sessionId;
    }

    this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendGetAgentProviderModels,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetAgentProviderModelsResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.agentModelsQuery.update({ models: resp.payload.models });
            this.applyModels(resp.payload.models);
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
    let haystack = [`${model.modelId} ${model.providerName}`];
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
