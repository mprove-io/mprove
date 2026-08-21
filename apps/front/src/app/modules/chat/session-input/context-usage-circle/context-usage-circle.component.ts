import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';
import type { AssistantMessage } from '@opencode-ai/sdk/v2';
import { combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EXPLORER_CONTEXT_USAGE_WARNING_PERCENTAGE } from '#common/constants/top';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { getExplorerContextBlockThreshold } from '#common/functions/get-explorer-context-block-threshold';
import type { LlmModelWithProvider } from '#common/zod/backend/llm-models/llm-model-with-provider';
import type { SessionMessageApi } from '#common/zod/backend/session-message-api';
import { SessionQuery } from '#front/app/queries/session.query';
import { SessionBundleQuery } from '#front/app/queries/session-bundle.query';
import { SessionModelsQuery } from '#front/app/queries/session-models.query';

@Component({
  standalone: false,
  selector: 'm-context-usage-circle',
  templateUrl: './context-usage-circle.component.html'
})
export class ContextUsageCircleComponent implements OnChanges, OnDestroy {
  @Input() modelExtraId: string;
  @Output() usageWarningChange = new EventEmitter<boolean>();
  @Output() usageLimitReachedChange = new EventEmitter<boolean>();

  strokeWidth = 2.5;
  radius = 11 - this.strokeWidth / 2;
  circumference = 2 * Math.PI * this.radius;
  dashOffset = this.circumference;

  percentage = 0;
  total = 0;
  contextLimit: number | undefined;
  totalFormatted = '';
  contextLimitFormatted = '';
  hasData = false;
  showUsageWarning = false;

  private messages: SessionMessageApi[] = [];
  private modelsOpencode: LlmModelWithProvider[] = [];
  private modelsAi: LlmModelWithProvider[] = [];
  private usageWarningTimeout: ReturnType<typeof setTimeout> | undefined;

  contextUsage$ = combineLatest([
    this.sessionBundleQuery.messages$,
    this.sessionModelsQuery.modelsOpencode$,
    this.sessionModelsQuery.modelsAi$
  ]).pipe(
    tap(([messages, modelsOpencode, modelsAi]) => {
      this.messages = messages;
      this.modelsOpencode = modelsOpencode;
      this.modelsAi = modelsAi;

      this.updateUsage();
    })
  );

  ngOnChanges(changes: SimpleChanges) {
    if (changes['modelExtraId']) {
      this.updateUsage();
    }
  }

  ngOnDestroy() {
    clearTimeout(this.usageWarningTimeout);
  }

  updateUsage() {
    this.percentage = 0;
    this.total = 0;
    this.contextLimit = undefined;
    this.totalFormatted = '';
    this.contextLimitFormatted = '';
    this.hasData = false;
    this.dashOffset = this.circumference;
    let showUsageWarning = false;
    let isUsageLimitReached = false;

    let found = [...this.messages].reverse().find(msg => {
      if (msg.role !== 'assistant') return false;

      let assistantMessage = msg.ocMessage as AssistantMessage;

      if (!assistantMessage.tokens) return false;

      let total =
        assistantMessage.tokens.input +
        assistantMessage.tokens.output +
        assistantMessage.tokens.reasoning +
        assistantMessage.tokens.cache.read +
        assistantMessage.tokens.cache.write;

      return total > 0;
    });

    if (found) {
      let assistantMessage = found.ocMessage as AssistantMessage;

      let total =
        assistantMessage.tokens.input +
        assistantMessage.tokens.output +
        assistantMessage.tokens.reasoning +
        assistantMessage.tokens.cache.read +
        assistantMessage.tokens.cache.write;

      this.total = total;
      this.totalFormatted = this.formatTokenCount({ count: total });
      this.hasData = true;

      let session = this.sessionQuery.getValue();

      let models =
        session.type === SessionTypeEnum.Explorer
          ? this.modelsAi
          : this.modelsOpencode;

      let selectedModel = this.findSelectedModel({ models: models });
      let assistantModel = models.find(
        m => m.modelId === assistantMessage.modelID
      );
      let usageModel = selectedModel ?? assistantModel;

      this.contextLimit = usageModel?.contextLimit ?? usageModel?.inputLimit;

      let blockThreshold: number | undefined = getExplorerContextBlockThreshold(
        {
          contextLimit: usageModel?.contextLimit,
          inputLimit: usageModel?.inputLimit,
          outputLimit: usageModel?.outputLimit
        }
      );

      isUsageLimitReached =
        blockThreshold !== undefined && total >= blockThreshold;

      if (this.contextLimit) {
        this.percentage = Math.round((total / this.contextLimit) * 100);
        let clamped = Math.max(0, Math.min(100, this.percentage));
        this.dashOffset = this.circumference * (1 - clamped / 100);
        this.contextLimitFormatted = this.formatTokenCount({
          count: this.contextLimit
        });
        showUsageWarning =
          this.percentage > EXPLORER_CONTEXT_USAGE_WARNING_PERCENTAGE;
      } else {
        this.dashOffset = this.circumference;
        this.contextLimitFormatted = '';
      }
    }

    this.usageLimitReachedChange.emit(isUsageLimitReached);
    this.updateUsageWarning({ show: showUsageWarning });
    this.cd.detectChanges();
  }

  findSelectedModel(item: { models: LlmModelWithProvider[] }) {
    let { models } = item;

    if (!this.modelExtraId) {
      return undefined;
    }

    let selected = this.modelExtraId.split('/');
    let providerId = selected[0];
    let modelId = selected.slice(1).join('/');

    return models.find(
      m => m.providerId === providerId && m.modelId === modelId
    );
  }

  updateUsageWarning(item: { show: boolean }) {
    let { show } = item;

    if (this.showUsageWarning === show) {
      return;
    }

    this.showUsageWarning = show;
    clearTimeout(this.usageWarningTimeout);

    this.usageWarningTimeout = setTimeout(() => {
      this.usageWarningChange.emit(show);
    });
  }

  formatTokenCount(item: { count: number }): string {
    let { count } = item;

    return count.toLocaleString('en-US').split(',').join(' ');
  }

  constructor(
    private sessionQuery: SessionQuery,
    private sessionBundleQuery: SessionBundleQuery,
    private sessionModelsQuery: SessionModelsQuery,
    private cd: ChangeDetectorRef
  ) {}
}
